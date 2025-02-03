const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  google_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profile_picture: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);