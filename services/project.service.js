import mongoose from "mongoose";
import projectModal from "../models/project.models.js";
import { body } from "express-validator";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  let project;
  try {
    project = projectModal.create({ name, user: [userId] });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project already exists");
    }
    throw error;
    console.log(error);
  }
  return project;
};

export const getAllProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  let projects;
  try {
    projects = projectModal.find({ user: userId });
  } catch (error) {
    throw new Error(error.message);
    console.log(error);
  }
  return projects;
};

export const addUser = async (projectId, users, userId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }

  if (!users) {
    throw new Error("At least one user is required");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users should be an array");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID is invalid");
  }

  const project = await projectModal.findOne({ _id: projectId, user: userId });
  if (!project) {
    throw new Error("Project not found");
  }


  const updatedProject = await projectModal.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: {
        user: { $each: users },
      },
    },
    {
      new: true,
    }
  );
  return updatedProject;
};

export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }

  const project = await projectModal.findOne({ _id: projectId }).populate("user");
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}