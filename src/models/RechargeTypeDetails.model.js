const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var nodejsUniqueNumericIdGenerator = require("nodejs-unique-numeric-id-generator")
require("dotenv").config();

const RechargeTypeSchema = new mongoose.Schema({
    qrcode: {
        type: String,
        default:`${process.env.MAIN_URL}/avtar/Avatar04.png`

    },
    paymentMethod: {
        type: String,
        default: ""

    },
    account: {
        type: String,
        default: ""
    },
  
}
)

module.exports = mongoose.model('RechargeTypeDetails', RechargeTypeSchema);