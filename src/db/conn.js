const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(`${process.env.dburl}`, {
    useNewUrlParser: true, useUnifiedTopology: true
})
    .then(() => {
        console.log(`Database Connected`);
    })
    .catch((err) => {
       console.log(err);
    })