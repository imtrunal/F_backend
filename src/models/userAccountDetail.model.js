const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

require("dotenv").config();

const userAccountSchema = new mongoose.Schema({

    userId: {
        type: String,
        default: ""

    },
    comment: {
        type: String,
        default: ""

    },
    date: {
        type: String,
        default: Date.parse(new Date())
    },
    points: {
        type: String,
        default: ""

    },
    image:{
        type: String,
        default: ""
    },
    //parity,minesweeper,recharge,withdraw,taskreward,checkin,lucky,crash
    type:{
        type: String,
        default: ""
    },
    // 1 - "+"
    // 0 - "-"
    tradeType:{
        type: String, 
        default: ""
    }
}
)

module.exports = mongoose.model('userAccountDetail', userAccountSchema);