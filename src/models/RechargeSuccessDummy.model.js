const mongoose = require("mongoose");
require("dotenv").config();

// const dummy = require('mongoose-dummy');
// const ignoredFields = ['_id', '__v', ];
// let genderValues = ["₹"]
const RechargeSuccessSchema = new mongoose.Schema({
    avtar: {
        type: String,
        default:`${process.env.MAIN_URL}/avtar/Avatar04.png`
    },
    recharge_amount: {
        type: Number,
        default: ""
    },
    currency: {
        type: String,
        default: "₹",
        // enum:genderValues
    },
    mobile_no: {
        type: String,
        default: ""
    }
}
)

module.exports = mongoose.model('Recharge_Success', RechargeSuccessSchema);
// let randomObject = dummy( mongoose.model('Register_Success', RegisterSuccessSchema), {
//     ignore: ignoredFields,
//     returnDate: true
// })