const mongoose = require("mongoose");
require("dotenv").config();

const withdrawSchema = new mongoose.Schema({
    userId: {
        type: String,
        default:""
    },
    point: {
        type: String,
        default: ""

    },
    fee: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    // 1 - account Number
    // 2-upi 
    mode: {
        type: String,
        default: ""
    },
      // 1 -wallet
    // 2-agent wallet 
    type: {
        type: String,
        default: ""
    },
    ifsc:{
        type: String,
        default: ""
    },
    account:{
        type: String,
        default: ""
    },
    transferredAccount:{
        type: String,
        default: ""
    },
    // 0-pending,
    // 1-success,
    // 2-cancel 
    status: {
        type: String,
        default: ""
    },
    date:{
        type: String,
        default:Date.parse(new Date())
    }

}
)

module.exports = mongoose.model('withdraw', withdrawSchema);