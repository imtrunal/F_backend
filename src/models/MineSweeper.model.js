const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const MinesweeperSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: ""
    },
    //0-pending
    // 1-completed
    // 2-failed 
    status: {
        type: String,
        default: ""
    },
    // 2 - 2x2
    // 4 - 4x4
    // 8 - 8x8
    type:{
        type: String,
        default: ""
    },
    avtar: {
        type: String,
        default: ""
    },
    select:{
        type: Number,
        default: 0
    },
    win_point:{
        type: String,
        default: ""
    },
    amount:{
        type: String,
        default: ""
    },
    currency:{
        type: String,
        default: "₹"
    },
    mineNumber:{
        type: String,
    },
    histList:{
        type: Array,
    },
    endDate: {
        type: String,
       
    },
    targetMine:{
        type: String,

    },
    startDate: {
        type: String,
        default: Date.parse(new Date())
    }

}
)

module.exports = mongoose.model('minesweeper', MinesweeperSchema);