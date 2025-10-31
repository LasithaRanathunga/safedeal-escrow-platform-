import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cookieParser from "cookie-parser";
import authRouter from "./auth/authRouts";
import { authenticateToken } from "./auth/authUtils";
import contractRouts from "./contract/contractRouts";
import userRouts from "./user/userRouts";
import cors from "cors";
import fileUploadRouts from "./handleFiles/fileHandler";
import multer from "multer";

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Allow all origins
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200); // Handle preflight requests
//   }

//   next();
// });

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());

app.use("/auth", authRouter);

app.use(authenticateToken);

app.use("/contract", contractRouts);

app.use("/user", userRouts);

app.use("/file", fileUploadRouts);

// Sample route
app.post("/", (req, res) => {
  console.log("Received a GET request");
  console.log(req.body);
  res.json({ message: "Hello from backend!" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (e.g. file too large)
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    // Custom errors from cb(new Error(...))
    return res.status(400).json({ error: err.message });
  }

  next();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
