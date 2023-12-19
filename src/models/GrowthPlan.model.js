const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

//DUMMY DATA 
const UserGrowthSchema = new mongoose.Schema({

    // 1-Iron   
    // 2- Bronze
    // 3 -sliver 
    // 4-gold  
    // 5-platinum 
    // 6-diamond 
    // 7 -Master 
    Leval: {
        type: String,
        default:""

    },
    type:{
        type: String,
        default:""
    },
    point:{
        type: Number,
        default:""
    },
    date: {
        type: String,
        default: Date.parse(new Date())
    }
   
}
)

module.exports = mongoose.model('Growth', UserGrowthSchema);