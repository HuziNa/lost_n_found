import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionName = process.env.SESSION_NAME || "sid";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: sessionName,
    secret: process.env.SESSION_SECRET || "change-this-session-secret-in-env",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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
