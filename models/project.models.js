import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      role: {
        type: String,
        enum: ["admin", "collaborator"],
        default: "collaborator",
      },
    },
  ],
});

const Project = mongoose.model("project", projectSchema);
export default Project;