const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('@mongoosejs/double');
const RankerTimeSchema = new mongoose.Schema({
    startTime: {
        type: String
    },
    endTime: {
        type: String
    }
}
)
module.exports = mongoose.model('RankerTime', RankerTimeSchema);