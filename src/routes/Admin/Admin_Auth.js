const jwt = require("jsonwebtoken");
require("dotenv").config();


const Admin_Auth = async (req, res, next) => {
    try {
        var accesstoken = req.headers['data']
        // console.log('accesstoken', accesstoken);
        const verifyUser = jwt.verify(accesstoken, process.env.REGISTER_TOKEN);
        if (verifyUser) {
            next();
        } else {
            res.status(401).send("Not Authorization");
        }
    } catch (error) {
        res.status(401).send("Not Authorization");
    }
}


module.exports = Admin_Auth;