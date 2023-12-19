const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const CheckInSchema = new mongoose.Schema({
    avtar: {
        type: String,
        default:`${process.env.MAIN_URL}/avtar/Avatar04.png`

    },
    mobile_no: {
        type: String,
        default: ""

    },
    win_amount: {
        type: String,
        default: ""
    },
    currency: {
        type: String,
        default: "₹"
    },
   
}
)

module.exports = mongoose.model('CheckInDummy', CheckInSchema);