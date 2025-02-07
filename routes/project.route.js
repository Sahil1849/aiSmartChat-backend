import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controller/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectController
);

router.get("/all", authMiddleware.authUser, projectController.getAllProjects);

router.put(
  "/add-user",
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("At least one user is required")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("User ID should be a string"),
  authMiddleware.authUser,
  projectController.addUser
);

router.get("/:projectId", authMiddleware.authUser, projectController.getProjectById);

export default router;
