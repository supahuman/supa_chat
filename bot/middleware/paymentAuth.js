import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * Middleware to authenticate payment requests using JWT token
 */
export const authenticatePayment = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const userId = req.headers["x-user-id"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error:
          "Authorization token required. Provide Bearer token in Authorization header.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID required. Provide X-User-ID header.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret);

    // Verify user exists (handle both ObjectId and string IDs)
    let user;

    // Check if userId is a valid ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

    if (isValidObjectId) {
      // Try to find by ObjectId
      user = await User.findById(userId);
    } else {
      // If not a valid ObjectId, search by other fields
      user = await User.findOne({
        $or: [
          { email: userId }, // Allow email as fallback
          { googleId: userId }, // Allow Google ID as fallback
        ],
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error:
          "User not found. Please make sure you are logged in with a valid account.",
      });
    }

    // Add user info to request
    req.userId = userId;
    req.user = user;
    req.companyId = user.companyId || "default-company"; // Use default if no company

    next();
  } catch (error) {
    console.error("❌ Payment authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
