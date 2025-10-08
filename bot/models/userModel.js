import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  
  // Basic user fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  
  // Authentication
  password: {
    type: String,
    required: function() {
      return this.provider === 'email';
    }
  },
  provider: {
    type: String,
    enum: ['google', 'email'],
    default: 'email'
  },
  
  // Profile
  profilePicture: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Legacy fields (for backward compatibility) - removed userId, using _id instead
  name: {
    type: String
  },
  companyId: {
    type: String
  },
  
  // User management
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userSchema.index({ companyId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('User', userSchema);
