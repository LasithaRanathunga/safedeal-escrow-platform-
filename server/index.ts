import express from "express";

import authRouter from "./auth/auth";

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Handle preflight requests
  }

  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/auth", authRouter);

// Sample route
app.post("/", (req, res) => {
  console.log("Received a GET request");
  console.log(req.body);
  res.json({ message: "Hello from backend!" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
