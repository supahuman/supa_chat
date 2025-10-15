// Backend health check utility
export const checkBackendHealth = async () => {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:4000";
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      timeout: 5000, // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend is healthy:", data);
      return { healthy: true, data };
    } else {
      console.warn("⚠️ Backend health check failed:", response.status);
      return { healthy: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error("❌ Backend health check failed:", error.message);
    return { healthy: false, error: error.message };
  }
};

// Check if backend is required for auth
export const isBackendRequired = () => {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.REQUIRE_BACKEND === "true"
  );
};
