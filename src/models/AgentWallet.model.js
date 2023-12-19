const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const AgentWalletSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: 0.000,
    },
    TodayIncome: {
        type: Number,
        default: 0
    },
    TodayInvite: {
        type: Number,
        default: 0
    },
    userId: {
        type: String,
    },
    date:{
        type:Date,
        default: new Date()
    }
}
,{  
    timestamps : true
} 
)   
module.exports = mongoose.model('Agent_Wallet', AgentWalletSchema);