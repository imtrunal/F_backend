const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const UserGrowthSchema = new mongoose.Schema({
    userId: {
        type: String,
        default:""

    },
    // 1-Iron   
    // 2- Bronze
    // 3 -sliver 
    // 4-gold  
    // 5-platinum 
    // 6-diamond 
    // 7 -Master 
    leval: {
        type: String,
        default:""
    },
    // 0 - open
    // 1 - eligible
    // 2-completed
    // 3- show 
    status:{
        type: String,
        default:"",
    },
    point:{
        type: Number,
        default:"",
    },
    date: {
        type: String,
        default: Date.parse(new Date())
    }
   
}
)

module.exports = mongoose.model('UserGrowth', UserGrowthSchema);