const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

require("dotenv").config();

const TaskRewardSchema = new mongoose.Schema({

    task: {
        type: String,
        default: ""

    },
    description: {
        type: String,
        default: ""

    },
    date: {
        type: String,
        default: Date.parse(new Date())
    },
    points: {
        type: String,
        default: ""

    },
    // 0-start
    // 1-go  
    // 2-completed
    status: {
        type: String,
        default: ""
    },
    range: {
        type: String,
        default: ""
    },
    image:{
        type: String,
        default: ""
    }, 
     
    order:{ type: String,
        default: ""},
    type: {
        type: String,
        default: ""
    }
}
)

module.exports = mongoose.model('TaskReward', TaskRewardSchema);