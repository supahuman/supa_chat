/**
 * Widget Debug Script
 * Add this to your production page to debug widget issues
 */

console.log("🔍 Widget Debug Information:");
console.log("================================");

// Check environment variables
console.log("Environment Variables:");
console.log(
  "NEXT_PUBLIC_BOT_API_URL:",
  process.env.NEXT_PUBLIC_BOT_API_URL || "NOT SET"
);
console.log(
  "NEXT_PUBLIC_AGENT_ID:",
  process.env.NEXT_PUBLIC_AGENT_ID || "NOT SET"
);
console.log(
  "NEXT_PUBLIC_COMPANY_API_KEY:",
  process.env.NEXT_PUBLIC_COMPANY_API_KEY || "NOT SET"
);
console.log(
  "NEXT_PUBLIC_USER_ID:",
  process.env.NEXT_PUBLIC_USER_ID || "NOT SET"
);
console.log(
  "NEXT_PUBLIC_EMBED_URL:",
  process.env.NEXT_PUBLIC_EMBED_URL || "NOT SET"
);

// Check if config is set
console.log("\nWidget Configuration:");
console.log("window.SupaChatbotConfig:", window.SupaChatbotConfig || "NOT SET");

// Check if embed script loaded
console.log("\nScript Loading:");
const embedScript = document.querySelector('script[src*="embed-modular.js"]');
console.log("Embed script element:", embedScript ? "FOUND" : "NOT FOUND");
if (embedScript) {
  console.log("Script src:", embedScript.src);
  console.log("Script loaded:", embedScript.complete ? "YES" : "NO");
}

// Check for errors
console.log("\nError Check:");
window.addEventListener("error", (e) => {
  if (e.filename && e.filename.includes("embed")) {
    console.error("❌ Widget Script Error:", e.message, e.filename);
  }
});

// Check network requests
console.log("\nNetwork Check:");
const originalFetch = window.fetch;
window.fetch = function (...args) {
  if (args[0] && args[0].includes("bot")) {
    console.log("🌐 Bot API Request:", args[0]);
  }
  return originalFetch.apply(this, args);
};

console.log("================================");
console.log("✅ Debug script loaded. Check console for widget information.");
