import { Router } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import * as projectController from "../controller/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Create a new project
router.post(
  "/create",
  authMiddleware.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectController
);

// Get all projects for the logged-in user
router.get("/all", authMiddleware.authUser, projectController.getAllProjects);

// Add users to a project
router.put(
  "/add-user",
  authMiddleware.authUser,
  projectController.addUser
);

// Remove a user from a project
router.put(
  "/remove-user",
  authMiddleware.authUser,
  projectController.removeUser
);

// Transfer project ownership
router.put(
  "/transfer-ownership",
  authMiddleware.authUser,
  projectController.transferOwnership
);

// Exit project route
router.delete(
  "/exit/:projectId",
  authMiddleware.authUser,
  projectController.exitProjectController
);

// Delete project route
router.delete("/delete/:projectId", authMiddleware.authUser, projectController.deleteProjectController);

// Get a specific project by ID
router.get(
  "/:projectId",
  authMiddleware.authUser,
  param("projectId")
    .isString().withMessage("Project ID is required")
    .custom((value) => isValidObjectId(value)).withMessage("Invalid Project ID"),
  projectController.getProjectById
);

export default router;