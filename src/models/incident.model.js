
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Incident title is required"],
      trim: true,
      minlength: [3, "Title must contain at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Incident description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    service: {
      type: String,
      required: [true, "Affected service is required"],
      trim: true,
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open",
      required: true,
    },

    source: {
      type: String,
      enum: ["manual", "monitoring", "api"],
      default: "manual",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Incident", incidentSchema);
