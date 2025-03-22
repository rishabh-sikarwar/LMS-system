import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from 'helmet'
import mongoSanitizer from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from "cookie-parser";
import cors from 'cors'
import dotenv from "dotenv";
import e from "express";
dotenv.config();

const port = process.env.PORT;
const app = express();

//Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 100, //Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again after 15 minutes",
});
 

//Security middleware
app.use(helmet())
app.use(mongoSanitizer())
app.use(hpp())
app.use('/api' , limiter)


//logging middleware
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//Body Parser Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser())

//Global Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Cors configuration
app.use(
  cors({
      origin: process.env.CLIENT_URL || "http://localhost:8001",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
      allowedHeaders:["Content-Type", "Authorization", "X-Requested-With", "device-remember-token", "Access-Control-Allow-Origin", "Origin", "Accept"]
  })
);

//API Routes

//404 error page not found
//it should always be at the bottom
//404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found !!!",
  });
});

app.listen(port, () => {
  console.log(`server is running at port ${port} in ${process.env.NODE_ENV}`);
});
