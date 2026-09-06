import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },

    priority: { 
      type: String, 
      default: 'Medium'
     },
     
     category: { 
       type: String 
     },

     date: {
      type: String
     },

    area: String,
    
    
    date: String,
    description: String,
    address: String,
    photos: [String],
    img: String,
    statusLabel: { type: String, default: 'Open' },
    statusClass: { type: String, default: '' },
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;