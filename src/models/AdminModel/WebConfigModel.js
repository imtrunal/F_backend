const mongoose = require("mongoose");
const WebConfigModel = new mongoose.Schema({
    web_config_name: {
        type: String,
        default: ""
    },
    web_config_value: {
        type: String,
        default: ""
    }
})



module.exports = mongoose.model("web_config", WebConfigModel);