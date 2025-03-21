import express from "express";
import connectDB from "./db/db.js";
import userRouter from "./routes/user.route.js";
import aiRouter from "./routes/ai.route.js";
import projectRouter from "./routes/project.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connectDB();

const app = express();
const cors = require("cors");
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
