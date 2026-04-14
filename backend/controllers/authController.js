import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Bakery from "../models/Bakery.js";

// just dummy navigation paths for frontend to know where to go after auth actions
const HERO_PAGE_PATH = "/hero";
const LOGIN_PAGE_PATH = "/login";
const REGISTERABLE_ROLES = ["customer", "owner"];

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phoneNumber: userDoc.phoneNumber,
    address: userDoc.address,
    bakeryManaged: userDoc.bakeryManaged,
  };
}

//we have the same api for registering both customers and owners but the data that is sent to the api is different for signing up  
// in the case of normal user the fields are left empty but for the owner the bakery name and bakery address are sent 
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      bakeryName,
      bakeryAddress,
    } = req.body;

    // random checks 
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        message: "name, email, password, and phoneNumber are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const selectedRole = (role || "customer").toLowerCase();

    if (!REGISTERABLE_ROLES.includes(selectedRole)) {
      return res.status(400).json({
        message: "role can only be customer or owner. admin is reserved.",
      });
    }

    if (selectedRole === "owner" && (!bakeryName || !bakeryAddress)) {
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
      phoneNumber: phoneNumber.trim(),
      address,
    });


    // if the user is an owner then a coreesponidng bakery prof is created and then linked back to the user
    if (selectedRole === "owner") {
      try {
        const bakery = await Bakery.create({
          name: bakeryName.trim(),
          owner: user._id,
          address: bakeryAddress,
          contactNumber: phoneNumber.trim(),
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

    user = await User.findById(user._id).select("-password");

    return res.status(201).json({
      message: "Signup successful.",
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

    // saving the jwt token in the browsers local storage 
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "change-this-secret-in-env",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
      redirectTo: HERO_PAGE_PATH,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
};
// dummy api will change later 
export const logoutUser = async (_req, res) => {
  return res.status(200).json({
    message: "Logout successful. Clear token on client side.",
    redirectTo: LOGIN_PAGE_PATH,
  });
};
