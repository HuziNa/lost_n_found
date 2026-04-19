import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

// Setup for loading .env correctly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const email = process.argv[2];
const newRole = process.argv[3] || "customer";

if (!email) {
  console.error("Usage: node scripts/manageRole.js <email> <role>");
  console.error("Roles: admin, owner, customer");
  process.exit(1);
}

async function updateRole() {
  try {
    const connectionString = process.env.DATABASE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("DATABASE_CONNECTION_STRING not found in .env file");
    }

    await mongoose.connect(connectionString);
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: newRole },
      { new: true }
    );

    if (user) {
      console.log(`✅ Success: ${user.email} is now a/an ${user.role}.`);
    } else {
      console.error("❌ User not found. Ensure the email is spelled correctly.");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

updateRole();
