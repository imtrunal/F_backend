const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const IncomeDetailsSchema = new mongoose.Schema({
    points: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0.00,
    },
    userId: {
        type: String,
        default: ""
    },
    //7 -Withdraw  
    //11 - All Income types
    //53- Ranking rewards
    //54 -Effective user reward
    //56 -other reward
    // 50 - Order commission
    // 55 - Invite cash back
    tradeType: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    comment: {
        type: String,
        default: ""
    },
    participantUserId: {
        type: String,
        default: ""
    },
    participantUserName: {
        type: String,
        default: ""
    },
    status:{
        type:String
    },
    date:{
        type:String,
        default:Date.now() 
    }
},
    { timestamps: true }

)
module.exports = mongoose.model('IncomeDetails', IncomeDetailsSchema);