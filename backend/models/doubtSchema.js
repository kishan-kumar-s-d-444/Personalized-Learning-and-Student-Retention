const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  senderName: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  subject: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Subject' },
  text: { type: String, required: true },
  senderType: { type: String, enum: ['student', 'teacher'], required: true },
  createdAt: { type: Date, default: Date.now },
  
  // Add additional fields for context and confidentiality
  senderClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Sclass' },
  receiverClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Sclass' }
});

module.exports = mongoose.model("Doubt", doubtSchema);
