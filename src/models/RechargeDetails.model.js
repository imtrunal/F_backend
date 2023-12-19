const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var nodejsUniqueNumericIdGenerator = require("nodejs-unique-numeric-id-generator")

const RechargeDetailsSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        default: ""
    },
    // 0-start 
    // 1-successFull
    // 2-canceled
    // 3-failed
    // 4-TimeOut 

    status: {
        type: String,
        default: ""

    },
    paymentMethod: {
        type: String,
    },
    amount: {
        type: Number,
        default: ""
    },
    userId: {
        type: String,
        default: ""
    },
    transcationScreenShot: {
        type: String,
        default: ""
    },
    Payee_account: {
        type: String,
        default: ""
    },
    Payment_account: {
        type: String,
        default: ""
    },
    u_transaction_id:{
        type: String,
        default:""
    },
    // 0-none
    // 1-pending
    // 2-invalid
    Compaint:{
        type: String,
        default: "0"   
    }
   
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('RechargeDetails', RechargeDetailsSchema);