import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);


// for testing 
app.get("/", (req, res) => {
  res.send("Server is working");
});

const PORT = process.env.PORT || 5001;

// 🚀 Start server FIRST
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // THEN connect DB
  await connectDB();
});
