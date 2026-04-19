import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    // this was removed in the latest edits this is necessary 
    contactNumber: { type: String },

    role: {
      type: String,
      enum: ["customer", "bakeryOwner", "admin"],
      required: true,
    },

    // if they are an owner, we link them to their bakeries
    bakeryManaged: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bakery' 
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);