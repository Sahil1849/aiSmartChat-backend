import * as projectService from "../services/project.service.js";
import userModal from "../models/user.models.js";
import { validationResult } from "express-validator";
import projectModal from "../models/project.models.js";

export const createProjectController = async (req, res) => {
  try {
    const { name } = req.body;

    // Find the logged-in user
    const loggedInUser = await userModal.findOne({ email: req.user.email });
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = loggedInUser._id.toString();

    // Create the project and add the creator as admin
    const project = await projectService.createProject({ name, userId });
    res.status(201).json({ project });
  } catch (error) {
    console.log("Error creating project:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeUser = async (req, res) => {
  const loggedInUser = await userModal.findOne({ email: req.user.email });
  if (!loggedInUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const loggedInUserId = loggedInUser._id.toString();
  try {
    const { projectId, userId } = req.body;
    const project = await projectService.removeUser(projectId, userId, loggedInUserId);
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferOwnership = async (req, res) => {

  const loggedInUser = await userModal.findOne({ email: req.user.email });
  if (!loggedInUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const loggedInUserId = loggedInUser._id.toString();
  try {
    const { projectId, newOwnerId } = req.body;
    const project = await projectService.transferOwnership(projectId, newOwnerId, loggedInUserId);
    res.status(200).json({ message: "Ownership transferred successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const loggedInUser = await userModal.findOne({ email: req.user.email });
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = loggedInUser._id;

    const projects = await projectService.getAllProjects(userId);
    res.status(200).json({ projects });
  } catch (error) {
    console.log("Error fetching projects:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId, users } = req.body;
  const loggedInUser = await userModal.findOne({ email: req.user.email });
  const userId = loggedInUser._id;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  if (!users) {
    return res.status(400).json({ message: "Users are required" });
  }

  if (!Array.isArray(users)) {
    return res.status(400).json({ message: "Users should be an array" });
  }

  try {
    // Add users to the project
    const project = await projectService.addUser(projectId, users, userId);

    // Fetch the updated project with populated collaborators
    const updatedProject = await projectModal
      .findById(projectId)
      .populate("members.user")
      .exec();

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await projectService.getProjectById({ projectId });
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

export const exitProjectController = async (req, res) => {
  const { projectId } = req.params;
  const loggedInUser = await userModal.findOne({ email: req.user.email });
  const loggedInUserId = loggedInUser._id;
  try {
    const project = await projectService.exitProjectService(projectId, loggedInUserId);
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProjectController = async (req, res) => {
  const { projectId } = req.params;
  const loggedInUser = await userModal.findOne({ email: req.user.email });
  const loggedInUserId = loggedInUser._id;
  try {
    const project = await projectService.deleteProjectService(projectId, loggedInUserId);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
