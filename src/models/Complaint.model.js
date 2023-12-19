const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ComplaintSchema = new mongoose.Schema({
    reason: {
        type: String,
      
    },
    p_method: {
        type: Array,

    },
    payee_account: {
        color: Array,
        number: Array
    },
    transferTime: {
        type: String,
        default:""
    },
    payment_account:{
        type: String,
        default:""
    },
    transaction_id:{
        type: String,
        default:""
    },
    u_transaction_id:{
        type: String,
        default:""
    },
    file:{
        type: String,
        default:""
    },
    userId:{
        type: String,
        default:""
    },
    date: {
        type: String,
        default: Date.parse(new Date())
    }
}
)



module.exports = mongoose.model('Complaint', ComplaintSchema);