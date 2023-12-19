const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();





const newSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: String,
        default:"00.00"
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
})

newSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})
newSchema.methods.generateToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.REGISTER_TOKEN)
        this.tokens = this.tokens.concat({ token: token })
        console.log('token', token);
        await this.save();
        return token;

    } catch (e) { console.log("error") }
}



const RegisterAdmin = new mongoose.model("RegisterAdmin", newSchema)

module.exports = RegisterAdmin