const mongoose = require("mongoose");
const CrashResult = new mongoose.Schema({
  round_number: {
    type: Number,
    default: 1
  },

  Crash: {
    type: String,
    default:'0x'
  },

  winning_id: {
    type: [String],
    default: []
  },
  loss_id: {
    type: [String],
    default: []
  },
 

},{
    timestamps:true
});

module.exports = mongoose.model("crash_result", CrashResult);
