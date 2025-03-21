import User from "../models/user.models.js";
import projectModal from "../models/project.models.js";

export const CreateUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  // Use the static `hashPassword` method from the User model
  const hashedPassword = await User.hashPassword(password);

  // Create a new user instance
  const newUser = new User({ email, password: hashedPassword });

  // Save the user to the database
  return newUser.save();
};

export const getAllUsersService = async ({ userId }) => {

  const users = await User.find({ _id: { $ne: userId } });
  return users;
};

export const getUserProfileService = async ({ id }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export const deleteUserService = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Step 1: Handle projects where the user is an admin
  const projectsWhereUserIsAdmin = await projectModal.find({
    "members.user": userId,
    "members.role": "admin"
  });

  for (const project of projectsWhereUserIsAdmin) {
    // Check if this user is the only admin in the project
    const adminMembers = project.members.filter(
      member => member.role === "admin" && !member.user.equals(userId)
    );

    if (adminMembers.length === 0) {
      // User is the only admin, find another member to promote
      const otherMembers = project.members.filter(
        member => !member.user.equals(userId)
      );

      if (otherMembers.length > 0) {
        // Promote the first non-admin member to admin
        const memberToPromote = otherMembers[0];
        await projectModal.updateOne(
          { _id: project._id, "members.user": memberToPromote.user },
          { $set: { "members.$.role": "admin" } }
        );
      } else {
        // No other members, delete the project
        await projectModal.findByIdAndDelete(project._id);
        continue; // Skip to the next project
      }
    }
    // If there are other admins, no need to promote anyone
  }

  // Step 2: Remove the user from all projects
  await projectModal.updateMany(
    { "members.user": userId },
    { $pull: { members: { user: userId } } }
  );

  // Step 3: Delete the user
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};