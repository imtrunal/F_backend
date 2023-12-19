const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const WalletSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: 0.00,
    },
    userId: {
        type: String,
    },

} 

)
module.exports = mongoose.model('Wallet', WalletSchema);