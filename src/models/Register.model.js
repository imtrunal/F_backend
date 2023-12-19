const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const RegisterSchema = new mongoose.Schema({
    mobile_no: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        default: ""
    },
    avtar: {
        type: String,
        default: `${process.env.MAIN_URL}/avtar/Avatar04.png`
    },
    inviterId: {    
        type: String,
        default: ""
    },
    nickName: {
        type: String,
        default: ""
    },
    socketId:{
        type: String,
        default: "" 
    },
    effective_user:{
        type: String,
        default: "false" 
    },
    tokens: [
        {
            accesstoken: {
                type: String,
                required: true,
            }
        }
    ]
}, {
    timestamps: true
}
)

RegisterSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});
RegisterSchema.methods.generateAccessToken = async function () {

    try {
        const accesstoken = jwt.sign({ _id: this._id.toString() }, process.env.ACCESS_TOKEN_KEY);
        this.tokens = this.tokens.concat({ accesstoken: accesstoken });
        await this.save();
        return accesstoken;
    } catch (error) {
    }
}

module.exports = mongoose.model('Register', RegisterSchema);
