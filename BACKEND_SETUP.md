# Backend Setup Guide

## 🚀 **Option A: Full Backend Integration**

This project now uses **Option A** - Full Backend Integration for authentication.

### **Requirements:**
- Backend server must be running for authentication to work
- MongoDB connection required
- JWT_SECRET environment variable needed

### **Quick Start:**

1. **Start Backend Server:**
   ```bash
   cd bot
   npm run dev
   ```
   Should see: `🚀 Server running on http://localhost:4000`

2. **Set Environment Variables:**
   Create `bot/.env` file:
   ```bash
   JWT_SECRET=a6165d85b2850655b1895178701307c12d5094997ab8fda5aa0e803ff2678175be4961cf79c1e2389fe935c821025abd76c5fb8e350e0f7a6b5328065d86e9ed
   MONGODB_URI=your-mongodb-connection-string
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
   
   **⚠️ SECURITY WARNING:** 
   - JWT_SECRET is REQUIRED - no fallback provided
   - Use the generated secret above or generate your own
   - Never use weak or default secrets in production

3. **Start Frontend:**
   ```bash
   cd chat-widget
   npm run dev
   ```

### **Authentication Flow:**
1. **Google OAuth** → Frontend gets user data
2. **Backend API** → Validates and stores user in MongoDB
3. **JWT Token** → Backend generates and returns JWT
4. **Frontend** → Stores JWT and user data in localStorage

### **Features:**
- ✅ **Database Persistence** - All users saved to MongoDB
- ✅ **JWT Authentication** - Proper token-based auth
- ✅ **Google OAuth** - Secure Google signup
- ✅ **Token Validation** - Backend validates all tokens
- ✅ **Health Checks** - Frontend checks backend availability

### **Error Handling:**
- If backend is down, authentication will fail with clear error message
- Frontend will show: "Backend is not available. Please ensure the backend server is running on port 4000."

### **Production:**
- Set `NEXT_PUBLIC_API_URL` to your production backend URL
- Ensure backend is always running
- Use proper JWT_SECRET in production
