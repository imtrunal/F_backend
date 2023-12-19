const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const CheckInBonusDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        default:""

    },
    coin:{
        type: String,
        default: ""
    },
    date: {
        type: String,
        default: Date.parse(new Date())
    }
   
}
)

module.exports = mongoose.model('CheckInBonus', CheckInBonusDataSchema);