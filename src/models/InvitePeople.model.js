const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const InvitePeopleSchema = new mongoose.Schema({
    leval: {
        type: String,
    },
    userId: {
        type: Number,
        default: 0
    },
    InviteeUserId: {
        type: Number,
        default: 0
    },
    //1 -Register
    Type: {
        type: Number,
    },
    date:{
        type:Date,
        default: new Date()
    }
}
)   
module.exports = mongoose.model('Invite_People', InvitePeopleSchema);