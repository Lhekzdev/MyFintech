const mongoose = require("mongoose")
const transactionSchema = new mongoose.Schema({

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  amount: { 
    type: Number, default: 0 },


    
  type: {
    type: String,
    enum: ["credit", "debit"],

  },


},
  { timestamps: true }
)

const Transaction = new mongoose.model("Transaction", transactionSchema)
module.exports = Transaction