import Bakery from "../models/Bakery.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import { sendBakeryApprovalEmail, sendBakeryRejectionEmail } from "../services/emailService.js";
import { ensureGlobalCategories } from "../utils/globalCategories.js";

const toIdString = (value) => (value ? value.toString() : null);

const serializeCategory = (categoryDoc) => ({
  id: toIdString(categoryDoc._id),
  name: categoryDoc.name,
  createdAt: categoryDoc.createdAt,
  updatedAt: categoryDoc.updatedAt,
});

const normalizeCategoryName = (value) => String(value || "").trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toBooleanFromQuery = (value) => {
  if (value === undefined) {
    return { value: null };
  }

  const normalized = String(value).toLowerCase().trim();
  if (normalized === "true") {
    return { value: true };
  }

  if (normalized === "false") {
    return { value: false };
  }

  return {
    error: "Query filter must be true or false.",
  };
};

const buildStatsByBakeryId = (statsRows) => {
  const map = new Map();

  for (const row of statsRows) {
    map.set(toIdString(row._id), {
      totalOrders: row.totalOrders || 0,
      pendingOrders: row.pendingOrders || 0,
      completedOrders: row.completedOrders || 0,
      totalRevenue: Number(Number(row.totalRevenue || 0).toFixed(2)),
    });
  }

  return map;
};

const serializeBakery = (bakeryDoc, stats) => ({
  id: toIdString(bakeryDoc._id),
  name: bakeryDoc.name,
  address: bakeryDoc.address,
  contactNumber: bakeryDoc.contactNumber,
  isActive: bakeryDoc.isActive,
  approvalStatus: bakeryDoc.approvalStatus,
  owner: bakeryDoc.ownerId
    ? {
        id: toIdString(bakeryDoc.ownerId._id || bakeryDoc.ownerId),
        name: bakeryDoc.ownerId.name,
        email: bakeryDoc.ownerId.email,
        contactNumber: bakeryDoc.ownerId.contactNumber,
        role: bakeryDoc.ownerId.role,
      }
    : null,
  orderStats: {
    totalOrders: stats?.totalOrders || 0,
    pendingOrders: stats?.pendingOrders || 0,
    completedOrders: stats?.completedOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
  },
  createdAt: bakeryDoc.createdAt,
  updatedAt: bakeryDoc.updatedAt,
});

const aggregateBakeryOrderStats = async (bakeryIds, orderFilter = {}) => {
  if (!bakeryIds.length) {
    return new Map();
  }

  const statsRows = await Order.aggregate([
    {
      $match: {
        bakeryId: { $in: bakeryIds },
        ...orderFilter,
      },
    },
    {
      $group: {
        _id: "$bakeryId",
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$totalPrice", 0],
          },
        },
      },
    },
  ]);

  return buildStatsByBakeryId(statsRows);
};

const getTopBakeryByMetric = async ({ sort }) => {
  const [topRow] = await Order.aggregate([
    {
      $group: {
        _id: "$bakeryId",
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$totalPrice", 0],
          },
        },
      },
    },
    {
      $sort: sort,
    },
    {
      $limit: 1,
    },
  ]);

  if (!topRow) {
    return null;
  }

  const bakery = await Bakery.findById(topRow._id)
    .populate("ownerId", "_id name email contactNumber role")
    .lean();

  if (!bakery) {
    return null;
  }

  return serializeBakery(bakery, {
    totalOrders: topRow.totalOrders || 0,
    pendingOrders: topRow.pendingOrders || 0,
    completedOrders: topRow.completedOrders || 0,
    totalRevenue: Number(Number(topRow.totalRevenue || 0).toFixed(2)),
  });
};

// API: GET /api/admin/bakeries
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// - Optional query params:
//   isActive=true|false (alias: functional=true|false)
// Returns:
// - 200:
//   {
//     message,
//     filters: { isActive },
//     totalBakeries,
//     bakeries: [
//       {
//         id,
//         name,
//         address,
//         contactNumber,
//         isActive,
//         owner: { id, name, email, contactNumber, role } | null,
//         orderStats: { totalOrders, pendingOrders, completedOrders, totalRevenue },
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
export const listAdminBakeries = async (req, res) => {
  try {
    const rawActivityFilter =
      req.query.isActive !== undefined
        ? req.query.isActive
        : req.query.functional;

    const rawApprovalFilter =
      req.query.approvalStatus !== undefined
        ? req.query.approvalStatus
        : req.query.approval;

    const activityFilterResult = toBooleanFromQuery(rawActivityFilter);
    if (activityFilterResult.error) {
      return res.status(400).json({
        message: `${activityFilterResult.error} Use isActive or functional query param.`,
      });
    }

    const filter = {};
    if (activityFilterResult.value !== null) {
      filter.isActive = activityFilterResult.value;
    }

    if (rawApprovalFilter !== undefined) {
      const normalized = String(rawApprovalFilter).toLowerCase().trim();
      if (!["pending", "approved", "rejected"].includes(normalized)) {
        return res.status(400).json({
          message: "approvalStatus must be pending, approved, or rejected.",
        });
      }
      filter.approvalStatus = normalized;
    }

    const bakeries = await Bakery.find(filter)
      .sort({ createdAt: -1 })
      .populate("ownerId", "_id name email contactNumber role")
      .lean();

    const bakeryIds = bakeries.map((bakery) => bakery._id);
    const statsByBakeryId = await aggregateBakeryOrderStats(bakeryIds);

    const serializedBakeries = bakeries.map((bakery) =>
      serializeBakery(bakery, statsByBakeryId.get(toIdString(bakery._id))),
    );

    return res.status(200).json({
      message: "Bakeries fetched successfully.",
      filters: {
        isActive: activityFilterResult.value,
        approvalStatus: filter.approvalStatus || null,
      },
      totalBakeries: serializedBakeries.length,
      bakeries: serializedBakeries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakeries.",
      error: error.message,
    });
  }
};

// API: GET /api/admin/bakeries/top-orders
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// Returns:
// - 200:
//   {
//     message,
//     topOrdersBakery: {
//       id,
//       name,
//       address,
//       contactNumber,
//       isActive,
//       owner,
//       orderStats: { totalOrders, pendingOrders, completedOrders, totalRevenue },
//       createdAt,
//       updatedAt
//     } | null
//   }
export const getTopOrdersBakery = async (_req, res) => {
  try {
    const topOrdersBakery = await getTopBakeryByMetric({
      sort: {
        totalOrders: -1,
        totalRevenue: -1,
      },
    });

    return res.status(200).json({
      message: "Top orders bakery fetched successfully.",
      topOrdersBakery,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching top orders bakery.",
      error: error.message,
    });
  }
};

// API: PATCH /api/admin/bakeries/:bakeryId/approval
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// - Body: { status: "approved" | "rejected" }
// Returns:
// - 200 with updated bakery + email status
export const updateBakeryApproval = async (req, res) => {
  try {
    const { bakeryId } = req.params;
    const { status } = req.body || {};

    if (!bakeryId) {
      return res.status(400).json({ message: "bakeryId is required." });
    }

    const normalizedStatus = String(status || "").toLowerCase().trim();
    if (!["approved", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "status must be approved or rejected.",
      });
    }

    const bakery = await Bakery.findById(bakeryId).populate(
      "ownerId",
      "name email",
    );

    if (!bakery) {
      return res.status(404).json({ message: "Bakery not found." });
    }

    bakery.approvalStatus = normalizedStatus;
    bakery.isActive = normalizedStatus === "approved";
    await bakery.save();

    const ownerName = bakery.ownerId?.name;
    const ownerEmail = bakery.ownerId?.email;

    const emailResult =
      normalizedStatus === "approved"
        ? await sendBakeryApprovalEmail({
            to: ownerEmail,
            ownerName,
            bakeryName: bakery.name,
          })
        : await sendBakeryRejectionEmail({
            to: ownerEmail,
            ownerName,
            bakeryName: bakery.name,
          });

    return res.status(200).json({
      message: "Bakery approval updated successfully.",
      bakery: {
        id: toIdString(bakery._id),
        name: bakery.name,
        isActive: bakery.isActive,
        approvalStatus: bakery.approvalStatus,
      },
      emailNotification: {
        sent: emailResult.sent,
        reason: emailResult.sent ? null : emailResult.reason,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating bakery approval.",
      error: error.message,
    });
  }
};

// API: GET /api/admin/bakeries/top-revenue
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// Returns:
// - 200:
//   {
//     message,
//     topRevenueBakery: {
//       id,
//       name,
//       address,
//       contactNumber,
//       isActive,
//       owner,
//       orderStats: { totalOrders, pendingOrders, completedOrders, totalRevenue },
//       createdAt,
//       updatedAt
//     } | null
//   }
// - Revenue is computed from completed orders only.
export const getTopRevenueBakery = async (_req, res) => {
  try {
    const topRevenueBakery = await getTopBakeryByMetric({
      sort: {
        totalRevenue: -1,
        totalOrders: -1,
      },
    });

    return res.status(200).json({
      message: "Top revenue bakery fetched successfully.",
      topRevenueBakery,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching top revenue bakery.",
      error: error.message,
    });
  }
};

// API: GET /api/admin/categories
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// Returns: list of global categories
export const listGlobalCategories = async (_req, res) => {
  try {
    const categories = await ensureGlobalCategories();

    return res.status(200).json({
      message: "Global categories fetched successfully.",
      categories: categories.map(serializeCategory),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching global categories.",
      error: error.message,
    });
  }
};

// API: POST /api/admin/categories
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be admin
// - Body: { name: String }
// Returns: created category
export const createCategory = async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body?.name);

    if (!name) {
      return res.status(400).json({
        message: "name is required.",
      });
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    }).lean();

    if (existing) {
      return res.status(409).json({
        message: "A category with this name already exists.",
      });
    }

    const category = await Category.create({ name });

    return res.status(201).json({
      message: "Category created successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating category.",
      error: error.message,
    });
  }
};