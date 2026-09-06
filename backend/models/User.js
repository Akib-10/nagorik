// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    division: { 
      type: String, 
      default: '' 
    },
    district: { 
      type: String, 
      default: '' 
    },
    subDistrict: { 
      type: String, 
      default: '' 
    },
    cityCorporation: { 
      type: String, 
      default: '' 
    },
    union: { 
      type: String, 
      default: '' 
    },
    wardNumber: { 
      type: String, 
      default: '' 
    },
    roadNumber: { 
      type: String, 
      default: '' 
    },
    houseNumber: { 
      type: String, 
      default: '' 
    },
  },

  { _id: false }
);

const privacySchema = new mongoose.Schema(
  {
    publicProfile: { 
      type: Boolean, 
      default: true 
    },
    showAddressDetails: { 
      type: Boolean, 
      default: true 
    },
    hideContactInfo: { 
      type: Boolean, 
      default: true 
    },
    showActivityLeaderboard: { 
      type: Boolean, 
      default: true 
    },
    anonymousReportingDefault: { 
      type: Boolean, 
      default: false 
    },
  },

  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: false,
    },

    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },

    address: { 
      type: addressSchema, default: () => ({}) 
    },
    privacy: { 
      type: privacySchema, default: () => ({}) 
    },
  },

  { timestamps: true }
);

// password save howar age auto-hash
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// login-e password compare korar jonno helper method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;