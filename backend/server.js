import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();

// launch express app and database connection
const app = express();
connectDB();

// insert API routes below

//

// start server
app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
