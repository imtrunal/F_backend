const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const CheckInDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        default:""

    },
    checkInDate: {
        type: String,
        default: ""

    },
    index: {
        type: String,
        default: ""
    },
    todayCheckIn: {
        type: String,
        default: ""
    },
    coin:{
        type: String,
        default: ""
    }
   
}
)

module.exports = mongoose.model('CheckIn', CheckInDataSchema);