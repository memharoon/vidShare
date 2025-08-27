const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ['consumer', 'creator'],
    default: 'consumer',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
