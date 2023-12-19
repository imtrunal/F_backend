const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
// const defaultAvtar=require("backend/images")
const BankAccountDetailSchema = new mongoose.Schema({
    name: {
        type: String,
       default:""
    },
    ifsc_code: {
        type: String,
        default:""
    },
    account_number:{
        type: String,
        default:""
    },
    //1 = bank
    //0 =upi
    mode:{
        type: String,
        default:""
    },
    userId:{
        type: String,
        default:""
    },
    upi_address:{
        type: String,
        default:""
    },
    date:{
        type: String,
        default:Date.parse(new Date())
    }
}
)
module.exports = mongoose.model('BankAccountDetail', BankAccountDetailSchema);