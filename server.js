import "dotenv/config";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.models.js";
import { resultMessage } from "./services/ai.service.js";

const port = process.env.PORT || 3000;

// Create the HTTP server
const server = http.createServer(app);

// Set up Socket.io with proper CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Middleware to verify JWT tokens for socket connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token ||
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

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.user);

  // Join the client to the project's room
  const roomId = socket.project._id.toString();
  socket.join(roomId);
  console.log(`Client joined room: ${roomId}`);

  // Handle custom events
  socket.on("project-message", async (data) => {
    
    const message = data.message;
    // Broadcast the message to others in the same room
    socket.broadcast.to(roomId).emit("project-message", data);
    const isAiPresent = message.includes("@ai");

    if (isAiPresent) {
      // Send AI response to the client
      const prompt = message.replace("@ai", "").trim();
      const aiResponse = await resultMessage(prompt);

      io.to(roomId).emit("project-message", {
        message: aiResponse,
        sender: "AI"
      });
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Error handling for the server
server.on("error", (err) => {
  console.error("Server error:", err);
});
