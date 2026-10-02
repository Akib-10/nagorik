// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    division: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    subDistrict: {
      type: String,
      default: '',
    },
    cityCorporation: {
      type: String,
      default: '',
    },
    union: {
      type: String,
      default: '',
    },
    wardNumber: {
      type: String,
      default: '',
    },
    roadNumber: {
      type: String,
      default: '',
    },
    houseNumber: {
      type: String,
      default: '',
    },
  },

  { _id: false }
);

const privacySchema = new mongoose.Schema(
  {
    publicProfile: {
      type: Boolean,
      default: true,
    },
    showAddressDetails: {
      type: Boolean,
      default: true,
    },
    hideContactInfo: {
      type: Boolean,
      default: true,
    },
    showActivityLeaderboard: {
      type: Boolean,
      default: true,
    },
    anonymousReportingDefault: {
      type: Boolean,
      default: false,
    },
  },

  { _id: false }
);

// Cloudinary reference + metadata only — never the binary/base64 image itself.
const profilePictureSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    resourceType: { type: String, default: 'image' },
    format: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    folder: { type: String, default: '' },
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
    isSuspended: {
      type: Boolean,
      default: false,
      required: false,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },

    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    // `avatar` is kept as a plain URL string for backward compatibility with the
    // existing UI. It mirrors profilePicture.url and never holds binary data.
    avatar: { type: String, default: '' },
    profilePicture: { type: profilePictureSchema, default: null },

    address: {
      type: addressSchema, default: () => ({})
    },
    privacy: {
      type: privacySchema, default: () => ({})
    },

    // Posts this user chose to hide from their own browse feed ("Hide post").
    // Only affects this user's feed; the posts stay public for everyone else.
    hiddenIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
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