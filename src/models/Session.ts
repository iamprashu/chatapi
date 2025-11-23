import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    sessionExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Sessions", sessionSchema);
