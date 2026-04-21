import bcrypt from "bcryptjs";
import Order from "../models/Order.js";
import User from "../models/User.js";

const ORDER_STATUSES = ["pending", "baking", "ready", "completed", "cancelled"];
const OWNER_ROLE = "bakeryOwner";

const toIdString = (value) => (value ? value.toString() : null);

function sanitizeUser(userDoc) {
  const baseUser = {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    contactNumber: userDoc.contactNumber,
    role: userDoc.role,
    address: userDoc.address,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };

  // Owners get extra bakery profile details for frontend owner dashboard.
  if (userDoc.role === OWNER_ROLE) {
    if (userDoc.bakeryManaged && userDoc.bakeryManaged._id) {
      baseUser.bakeryManaged = {
        id: toIdString(userDoc.bakeryManaged._id),
        name: userDoc.bakeryManaged.name,
        address: userDoc.bakeryManaged.address || null,
        contactNumber: userDoc.bakeryManaged.contactNumber || null,
        myStory: userDoc.bakeryManaged.myStory || "",
        storyQuote: userDoc.bakeryManaged.storyQuote || "",
        statsYears: userDoc.bakeryManaged.statsYears || "",
        statsCustomers: userDoc.bakeryManaged.statsCustomers || "",
        statsRecipes: userDoc.bakeryManaged.statsRecipes || "",
        statsBaked: userDoc.bakeryManaged.statsBaked || "",
        imageUrl: userDoc.bakeryManaged.imageUrl || "",
        ownerId: toIdString(userDoc.bakeryManaged.ownerId),
        isActive: userDoc.bakeryManaged.isActive,
        approvalStatus: userDoc.bakeryManaged.approvalStatus,
      };
    } else {
      baseUser.bakeryManaged = userDoc.bakeryManaged
        ? { id: toIdString(userDoc.bakeryManaged) }
        : null;
    }
  }

  return baseUser;
}

// API: GET /api/users/me
// Expects:
// - Session cookie from /api/auth/login (sid by default)
// Returns:
// - 200 (customer): id, name, email, contactNumber, role, address, createdAt, updatedAt
// - 200 (bakeryOwner): above fields + bakeryManaged { id, name, address, contactNumber, ownerId, isActive }
export const getMyDetails = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id)
      .select("-password")
      .populate(
        "bakeryManaged",
        "_id name address contactNumber myStory storyQuote statsYears statsCustomers statsRecipes statsBaked imageUrl ownerId isActive approvalStatus",
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching user details.",
      error: error.message,
    });
  }
};

// API: PATCH /api/users/me
// Expects:
// - Session cookie from /api/auth/login (sid by default)
// - Body (any one or many):
//   { name: String, address: String, email: String, contactNumber: String, password: String }
// - Aliases supported for contactNumber: phoneNumber, number
// Returns:
// - 200 with role-based user fields (same output shape as GET /api/users/me)
export const updateMyAccount = async (req, res) => {
  try {
    const {
      name,
      address,
      email,
      contactNumber,
      phoneNumber,
      number,
      password,
    } = req.body;
    const contactValue = contactNumber ?? phoneNumber ?? number;

    if (
      name === undefined &&
      address === undefined &&
      email === undefined &&
      contactValue === undefined &&
      password === undefined
    ) {
      return res.status(400).json({
        message:
          "At least one updatable field is required: name, address, email, contactNumber, or password.",
      });
    }

    const user = await User.findById(req.authUser.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (name !== undefined) {
      const normalizedName = String(name).trim();

      if (!normalizedName) {
        return res.status(400).json({
          message: "name cannot be empty.",
        });
      }

      user.name = normalizedName;
    }

    if (address !== undefined) {
      const normalizedAddress = String(address).trim();

      if (!normalizedAddress) {
        return res.status(400).json({
          message: "address cannot be empty.",
        });
      }

      user.address = normalizedAddress;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "email cannot be empty.",
        });
      }

      const existingUserWithEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUserWithEmail) {
        return res.status(409).json({
          message: "Another user already has this email.",
        });
      }

      user.email = normalizedEmail;
    }

    if (contactValue !== undefined) {
      const normalizedContactNumber = String(contactValue).trim();

      if (!normalizedContactNumber) {
        return res.status(400).json({
          message: "contactNumber cannot be empty.",
        });
      }

      user.contactNumber = normalizedContactNumber;
    }

    if (password !== undefined) {
      const normalizedPassword = String(password).trim();

      if (normalizedPassword.length < 6) {
        return res.status(400).json({
          message: "password must be at least 6 characters long.",
        });
      }

      user.password = await bcrypt.hash(normalizedPassword, 12);
    }

    await user.save();

    if (user.role === OWNER_ROLE && user.bakeryManaged) {
      await user.populate(
        "bakeryManaged",
        "_id name address contactNumber myStory storyQuote statsYears statsCustomers statsRecipes statsBaked imageUrl ownerId isActive approvalStatus",
      );
    }

    return res.status(200).json({
      message: "Account updated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating account.",
      error: error.message,
    });
  }
};

// API: GET /api/users/me/orders
// Expects:
// - Session cookie from /api/auth/login (sid by default)
// - Optional query params: page, limit, status (pending|baking|ready|completed|cancelled)
// Returns:
// - 200 with Order schema columns:
//   userId, bakeryId, items[{ productId, quantity, selectedOptions[{ optionName, choiceName, ingredientId, quantity, layer }], finalPrice }], totalPrice, status, createdAt, updatedAt
export const getMyPastOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const normalizedStatus = req.query.status
      ? String(req.query.status).toLowerCase().trim()
      : null;

    if (normalizedStatus && !ORDER_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "status must be one of: pending, baking, ready, completed, cancelled.",
      });
    }

    const filter = { userId: req.authUser.id };
    if (normalizedStatus) {
      filter.status = normalizedStatus;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("bakeryId", "_id name isActive")
        .populate(
          "items.productId",
          "_id name type basePrice bakeryId categoryId",
        )
        .lean(),
      Order.countDocuments(filter),
    ]);

    const serializedOrders = orders.map((order) => ({
      id: toIdString(order._id),
      userId: toIdString(order.userId),
      bakeryId: order.bakeryId?._id
        ? toIdString(order.bakeryId._id)
        : toIdString(order.bakeryId),
      bakery: order.bakeryId?._id
        ? {
            id: toIdString(order.bakeryId._id),
            name: order.bakeryId.name,
            isActive: order.bakeryId.isActive,
          }
        : null,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items || []).map((item) => ({
        productId: item.productId?._id
          ? toIdString(item.productId._id)
          : toIdString(item.productId),
        product: item.productId?._id
          ? {
              id: toIdString(item.productId._id),
              name: item.productId.name,
              type: item.productId.type,
              basePrice: item.productId.basePrice,
              bakeryId: toIdString(item.productId.bakeryId),
              categoryId: toIdString(item.productId.categoryId),
            }
          : null,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        selectedOptions: (item.selectedOptions || []).map((option) => ({
          optionName: option.optionName,
          choiceName: option.choiceName,
          ingredientId: toIdString(option.ingredientId),
          quantity: option.quantity,
          layer: option.layer,
        })),
      })),
    }));

    return res.status(200).json({
      message: "Past orders fetched successfully.",
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders: serializedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching past orders.",
      error: error.message,
    });
  }
};
