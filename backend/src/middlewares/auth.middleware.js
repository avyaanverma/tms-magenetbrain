const userModel = require("../models/user.model")
const adminModel = require("../models/admin.model")
const jwt  = require("jsonwebtoken")

async function authAdminMiddleware(req, res, next){
    const token = req.cookies.token

    if(!token){
        return res.status(400).json({
            message: "Unauthorized access."
        })
    }

    try{
        // decode karne ke liye hum verifiy functon lenge jo token aur secret key usko decode krdega
        // yaha se ek object return hoga
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const admin = await adminModel.findById(decoded.id)
        if (!admin) {
            return res.status(401).json({
                message: "Admin not found."
            })
        }

        req.admin = admin
        req.userId = decoded.id
        
        next()

    } catch(err){
        return res.status(401).json({
            message: "Invalid Token."
        })
    }
}

async function authUserMiddleware(req,res,next){
    const token = req.cookies.token
    
    if(!token){
        return res.status(400).json({
            message: "Unauthorized access."
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        req.user = user

        next()


    }catch(err){
        return res.status(400).json({
            message: err
        })
    }
}

async function authAdminOrUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find user
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.user = user;
            return next();
        }

        // Try to find admin
        const admin = await adminModel.findById(decoded.id);
        if (admin) {
            req.admin = admin;
            return next();
        }

        // Neither found
        return res.status(404).json({ message: "User or Admin not found." });

    } catch (err) {
        return res.status(401).json({ message: "Invalid token." });
    }
}

module.exports = {
    authAdminMiddleware,
    authUserMiddleware,
    authAdminOrUser
}