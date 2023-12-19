const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
// const defaultAvtar=require("backend/images")
const fastParitySchema = new mongoose.Schema({
    period: {
        type: String,
      
    },
    user: {
        type: String,
    },
    select_number:{
        type: String,
    },
    point:{
        type: String,
    },
    avtar:{
        type: String,
        default:`${process.env.MAIN_URL}/avtar/Avatar04.png`
    },
    Amount:{
        type: String,

    },
    currency:{
        type: String,
        default:"₹"
    },
    value:{
        type:String
    },
    date:{
        type: String,
        default:Date.parse(new Date())
    }
}
)



module.exports = mongoose.model('fastParity', fastParitySchema);