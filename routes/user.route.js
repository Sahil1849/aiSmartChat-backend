import { Router } from "express";
import { body } from "express-validator";
import * as userController from "../controller/user.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";
const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email is not valid"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.createUserController
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email is not valid"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.loginUserController
);

router.get("/profile",authMiddleware.authUser, userController.getUserProfile);

router.post("/logout", authMiddleware.authUser, userController.logoutUserController);

router.get("/all", authMiddleware.authUser, userController.getAllUsers);

router.get("/currentUser/:id", authMiddleware.authUser, userController.getUserProfile);

router.delete("/delete/:id", authMiddleware.authUser, userController.deleteUserController);

export default router;
