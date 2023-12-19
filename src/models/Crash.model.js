const mongoose = require("mongoose");
const Crash = new mongoose.Schema({
  round_number: {
    type: Number,
    default: 1
  },

  user: {
    type: String,
    default:'0'
  },

  target: {
    type: String,
    default: ""
  },
  amount:{
    type: String,
    default: ""
  },
  point:{
    type: String,
    default: ""
  }
,
  win_amount:{
    type: String,
    default: ""
  }
 

},{
    timestamps:true
});

module.exports = mongoose.model("crash", Crash);
