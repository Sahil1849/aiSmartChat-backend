import * as projectService from "../services/project.service.js";
import userModal from "../models/user.models.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  try {
    const { name } = req.body;
    const loggedInUser = await userModal.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    const project = await projectService.createProject({ name, userId });
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const loggedInUser = await userModal.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    const projects = await projectService.getAllProjects(userId);
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId, users } = req.body;
  console.log("projectId", projectId);
  console.log("users", users);
  const loggedInUser = await userModal.findOne({ email: req.user.email });
  console.log("loggedInUser", loggedInUser);
  const userId = loggedInUser._id;
  try {
    const project = await projectService.addUser(projectId, users, userId);
    console.log("return Project", project);
    res.status(200).json({ project });
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
