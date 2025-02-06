const Doubt = require("../models/doubtSchema");
const Student = require("../models/studentSchema");
const Teacher = require("../models/teacherSchema");

exports.createDoubt = async (req, res) => {
  try {
    const { senderId, receiverId, text, senderType } = req.body;
    
    // Validate sender and receiver
    let sender, receiver;
    if (senderType === 'student') {
      sender = await Student.findById(senderId);
      receiver = await Teacher.findById(receiverId);
    } else {
      sender = await Teacher.findById(senderId);
      receiver = await Student.findById(receiverId);
    }

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or Receiver not found" });
    }

    const newDoubt = new Doubt({
      senderId,
      receiverId,
      text,
      senderType,
      createdAt: new Date()
    });
    
    const savedDoubt = await newDoubt.save();
    res.status(201).json(savedDoubt);
  } catch (err) {
    console.error("Doubt Creation Error:", err);
    res.status(500).json({ message: "Error creating doubt", error: err });
  }
};

exports.getDoubts = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    
    // Validate input
    if (!userId || !userType) {
      return res.status(400).json({ message: "User ID and Type are required" });
    }

    const doubts = await Doubt.find({
      $or: [
        { 
          senderId: userId, 
          senderType: userType,
          receiverId: { $exists: true } 
        },
        { 
          receiverId: userId 
        }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name')  // Populate sender details
    .populate('receiverId', 'name');  // Populate receiver details

    res.status(200).json(doubts);
  } catch (err) {
    console.error("Get Doubts Error:", err);
    res.status(500).json({ message: "Error fetching doubts", error: err });
  }
};

// New method to get conversation between two specific users
exports.getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    const doubts = await Doubt.find({
      $or: [
        { 
          senderId: senderId, 
          receiverId: receiverId 
        },
        { 
          senderId: receiverId, 
          receiverId: senderId 
        }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name')
    .populate('receiverId', 'name');

    res.status(200).json(doubts);
  } catch (err) {
    console.error("Get Conversation Error:", err);
    res.status(500).json({ message: "Error fetching conversation", error: err });
  }
};
