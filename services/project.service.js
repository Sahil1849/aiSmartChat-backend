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
    project = await projectModal.create({
      name,
      members: [
        {
          user: userId,
          role: "admin",
        },
      ],
    });

  } catch (error) {

    console.log("Error during project creation:", error);
    throw error;
  }

  return project;
};

export const getAllProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  let projects;
  try {
    projects = await projectModal
      .find({ "members.user": userId })
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
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

  // Find project and verify admin status
  const project = await projectModal.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Check if user is an admin in the project
  const isAdmin = project.members.some(
    (member) => member.user.equals(userId) && member.role === "admin"
  );
  if (!isAdmin) throw new Error("Unauthorized: Only admins can add collaborators");

  // Prevent duplicates
  const existingUserIds = project.members.map(m => m.user.toString());
  const newUsers = users.filter(id => !existingUserIds.includes(id));

  // Add new collaborators
  if (newUsers.length > 0) {
    await projectModal.findByIdAndUpdate(
      projectId,
      {
        $push: {
          members: {
            $each: newUsers.map(id => ({ user: id, role: "collaborator" }))
          }
        }
      },
      { new: true }
    );
  }

  return project;
};

export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }

  const project = await projectModal.findOne({ _id: projectId }).populate("members.user");
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export const removeUser = async (projectId, userId, loggedInUserId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is invalid");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID is invalid");
  }

  if (!loggedInUserId) {
    throw new Error("Logged-in User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
    throw new Error("Logged-in User ID is invalid");
  }

  // Find project and verify admin status
  const project = await projectModal.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Check if the logged-in user is an admin
  const isAdmin = project.members.some(
    (member) => member.user.equals(loggedInUserId) && member.role === "admin"
  );
  if (!isAdmin) throw new Error("Unauthorized: Only admins can remove collaborators");

  // Check if the user exists in the project
  const existingUserIds = project.members.map((m) => m.user.toString());
  if (!existingUserIds.includes(userId)) {
    throw new Error("User not found in the project");
  }

  // Remove the user
  const updatedProject = await projectModal.findByIdAndUpdate(
    projectId,
    { $pull: { members: { user: userId } } },
    { new: true }
  );

  if (!updatedProject) throw new Error("Failed to remove user from project");
  return updatedProject;
};

export const transferOwnership = async (projectId, newOwnerId, loggedInUserId) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  if (!newOwnerId || !mongoose.Types.ObjectId.isValid(newOwnerId)) {
    throw new Error("Valid New Owner ID is required");
  }

  if (!loggedInUserId || !mongoose.Types.ObjectId.isValid(loggedInUserId)) {
    throw new Error("Valid Logged-in User ID is required");
  }

  const project = await projectModal.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Check if the logged-in user is an admin
  const adminMember = project.members.find(
    (member) => member.user.equals(loggedInUserId) && member.role === "admin"
  );

  if (!adminMember) {
    throw new Error("Unauthorized: Only admins can transfer ownership");
  }

  // Check if the new owner is already a project member
  const newOwnerMember = project.members.find((member) => member.user.equals(newOwnerId));
  if (!newOwnerMember) {
    throw new Error("New owner must be a member of the project");
  }

  // Update roles
  newOwnerMember.role = "admin";
  await project.save();

  return project;
};

export const exitProjectService = async (projectId, loggedInUserId) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  if (!loggedInUserId || !mongoose.Types.ObjectId.isValid(loggedInUserId)) {
    throw new Error("Valid User ID is required");
  }

  const project = await projectModal.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Check if the user is a member of the project
  const memberIndex = project.members.findIndex(
    (member) => member.user.equals(loggedInUserId)
  );

  if (memberIndex === -1) {
    throw new Error("User is not a member of the project");
  }

  const member = project.members[memberIndex];

  // Handle Admin exit conditions
  if (member.role === 'admin') {
    // Count existing admins in the project
    const adminCount = project.members.filter(m => m.role === 'admin').length;

    if (adminCount <= 1) {
      // If there's only one admin, find another member to transfer admin rights to
      const otherMemberIndex = project.members.findIndex(
        (m) => !m.user.equals(loggedInUserId)
      );

      if (otherMemberIndex === -1) {
        throw new Error("Cannot Exit. Delete the Project");
      }

      // Transfer admin rights to the next available member
      project.members[otherMemberIndex].role = 'admin';
    }

    // Remove the admin from the project
    project.members.splice(memberIndex, 1);
  }
  // Handle Collaborator exit
  else {
    project.members.splice(memberIndex, 1);
  }

  const updatedProject = await project.save();
  return updatedProject;
};

export const deleteProjectService = async (projectId, loggedInUserId) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }
  if (!loggedInUserId || !mongoose.Types.ObjectId.isValid(loggedInUserId)) {
    throw new Error("Valid User ID is required");
  }
  const project = await projectModal.findById(projectId);
  if (!project) throw new Error("Project not found");
  const adminMember = project.members.find(
    (member) => member.user.equals(loggedInUserId) && member.role === "admin"
  );
  if (!adminMember) {
    throw new Error("Unauthorized: Only admins can delete projects");
  }
  await projectModal.findByIdAndDelete(projectId);
  return "Project deleted successfully";
}