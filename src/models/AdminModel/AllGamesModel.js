const mongoose = require("mongoose");
const AllGamesModel = new mongoose.Schema({
    game_name: {
        type: String,
        default: ""
    },
    game_logo: {
        type: String,
        default: ""
    },
    //0:status false(game hide)
    //1:status true (game show)
    game_status: {
        type: String,
        default: "1"
    }
})



module.exports = mongoose.model("all_games", AllGamesModel);