import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Bakery from "../models/Bakery.js";

// just dummy navigation paths for frontend to know where to go after auth actions
const HERO_PAGE_PATH = "/hero";
const LOGIN_PAGE_PATH = "/login";
const OWNER_ROLE = "bakeryOwner";
const REGISTERABLE_ROLES = ["customer", OWNER_ROLE];
const ROLE_ALIAS_MAP = {
  customer: "customer",
  owner: OWNER_ROLE,
  bakeryowner: OWNER_ROLE,
};

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

  // Owners get extra bakery details in auth responses, same as user profile APIs.
  if (userDoc.role === OWNER_ROLE) {
    if (userDoc.bakeryManaged && userDoc.bakeryManaged._id) {
      baseUser.bakeryManaged = {
        id: toIdString(userDoc.bakeryManaged._id),
        name: userDoc.bakeryManaged.name,
        address: userDoc.bakeryManaged.address || null,
        contactNumber: userDoc.bakeryManaged.contactNumber || null,
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

const findUserForResponse = (userId) =>
  User.findById(userId)
    .select("-password")
    .populate(
      "bakeryManaged",
      "_id name address contactNumber ownerId isActive approvalStatus",
    );

const saveSession = (req, userDoc) =>
  new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.userId = userDoc._id.toString();
    req.session.role = userDoc.role;

    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

//we have the same api for registering both customers and owners but the data that is sent to the api is different for signing up
// in the case of normal user the fields are left empty but for the owner the bakery name and bakery address are sent
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      contactNumber,
      phoneNumber,
      number,
      address,
      bakeryName,
      bakeryAddress,
    } = req.body;

    const providedContactNumber = (contactNumber ?? phoneNumber ?? number ?? "")
      .toString()
      .trim();

    // random checks
    if (!name || !email || !password || !providedContactNumber) {
      return res.status(400).json({
        message:
          "name, email, password, and contactNumber are required (phoneNumber/number are also accepted).",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRoleInput = (role || "customer").toLowerCase().trim();
    const selectedRole = ROLE_ALIAS_MAP[normalizedRoleInput];

    if (!selectedRole || !REGISTERABLE_ROLES.includes(selectedRole)) {
      return res.status(400).json({
        message:
          "role can only be customer or bakeryOwner (owner alias supported). admin is reserved.",
      });
    }

    if (selectedRole === "bakeryOwner" && (!bakeryName || !bakeryAddress)) {
      return res.status(400).json({
        message: "For owner signup, bakeryName and bakeryAddress are required.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole,
      contactNumber: providedContactNumber,
      address: address ? String(address).trim() : undefined,
    });

    // if the user is an owner then a coreesponidng bakery prof is created and then linked back to the user
    if (selectedRole === "bakeryOwner") {
      try {
        const bakery = await Bakery.create({
          name: bakeryName.trim(),
          ownerId: user._id,
          address: String(bakeryAddress).trim(),
          contactNumber: providedContactNumber,
          isActive: false,
          approvalStatus: "pending",
        });

        user.bakeryManaged = bakery._id;
        await user.save();
      } catch (ownerCreateError) {
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message: "Failed to create owner bakery profile.",
          error: ownerCreateError.message,
        });
      }
    }

    if (selectedRole !== OWNER_ROLE) {
      await saveSession(req, user);
    }

    user = await findUserForResponse(user._id);

    return res.status(201).json({
      message:
        selectedRole === OWNER_ROLE
          ? "Signup submitted. Your bakery is pending admin approval."
          : "Signup successful.",
      user: sanitizeUser(user),
      redirectTo: HERO_PAGE_PATH,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user.",
      error: error.message,
    });
  }
};

// pretty starightforward login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);

    // Backward compatibility if an older user was saved with plain text password.
    if (!isPasswordValid && user.password === password) {
      isPasswordValid = true;
      user.password = await bcrypt.hash(password, 12);
      await user.save();
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.role === OWNER_ROLE) {
      const bakery = user.bakeryManaged
        ? await Bakery.findById(user.bakeryManaged)
        : await Bakery.findOne({ ownerId: user._id });

      if (!bakery) {
        return res.status(403).json({
          message: "Bakery profile not found. Please contact support.",
        });
      }

      const approvalStatus = bakery.approvalStatus || "approved";
      if (approvalStatus !== "approved") {
        const statusMessage =
          approvalStatus === "rejected"
            ? "Your bakery application was rejected. Please contact support."
            : "Your bakery application is pending approval.";
        return res.status(403).json({ message: statusMessage });
      }

      if (!bakery.isActive) {
        return res.status(403).json({
          message: "Your bakery is currently inactive. Please contact support.",
        });
      }
    }

    await saveSession(req, user);

    const userForResponse = await findUserForResponse(user._id);

    return res.status(200).json({
      message: "Login successful.",
      user: sanitizeUser(userForResponse),
      redirectTo: HERO_PAGE_PATH,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  const sessionCookieName = process.env.SESSION_NAME || "sid";

  if (!req.session) {
    return res.status(200).json({
      message: "Logout successful.",
      redirectTo: LOGIN_PAGE_PATH,
    });
  }

  return req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Error logging out.",
        error: error.message,
      });
    }

    res.clearCookie(sessionCookieName);

    return res.status(200).json({
      message: "Logout successful.",
      redirectTo: LOGIN_PAGE_PATH,
    });
  });
};
