const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const InviteLinkSchema = new mongoose.Schema({
    invite_link: {
        type: Object,
        default:"",
    },
    userId: {
        type: String,
    },
} 

)
module.exports = mongoose.model('inviteLink', InviteLinkSchema);