import "dotenv/config";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.models.js";
import { resultMessage } from "./services/ai.service.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // IMPORTANT: Use the full production URL including protocol
    origin: [
      "https://ai-smart-chat-frontend.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
  // Force websocket transport (and allow polling fallback if needed)
  transports: ["websocket", "polling"],
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("No token provided"));

    const projectId = socket.handshake.query.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId provided"));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.project = project;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.user);

  // Join the client to the project's room
  const roomId = socket.project._id.toString();
  socket.join(roomId);
  console.log(`Client joined room: ${roomId}`);

  socket.on("project-message", async (data) => {
    const message = data.message;
    const timestamp = new Date().toLocaleTimeString();

    // Broadcast the message to others in the same room
    socket.broadcast.to(roomId).emit("project-message", {
      ...data,
      timestamp,
    });

    // Check for AI trigger keyword
    const isAiPresent = message.includes("@ai");
    if (isAiPresent) {
      const prompt = message.replace("@ai", "").trim();
      const aiResponse = await resultMessage(prompt);

      if (typeof aiResponse !== "string") {
        console.error("Invalid AI response type:", aiResponse);
        return;
      }

      // Emit the AI response to everyone in the room
      io.to(roomId).emit("project-message", {
        message: aiResponse,
        sender: "AI",
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
