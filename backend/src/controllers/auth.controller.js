const userModel = require("../models/user.model")
const adminModel = require("../models/admin.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

async function registerUser(req,res){
    const {username, email, password} = req.body;

    const isUserExists = await userModel.findOne({
        email
    })

    if(isUserExists){
        return res.status(400).json({
            message: "email already exists."
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token)


    res.status(201).json({
        message: "User Created Successfully.",
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    })

    

    
}
async function loginUser(req,res){
    const {email, password} = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            message: "Unauthorized Access."
        })
    }

    const checkPassword = bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(400).json({
            message: "Unauthorized Access."
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    return res.status(201).json({
        message: "User loggined successfully.",
        user: {
            id : user._id,
            username: user.username,
            email: user.email,
        }
    })
}
async function registerAdminUser(req,res){
    const {username, email, password} = req.body;

    const isUserExists = await adminModel.findOne({
        email
    })

    if(isUserExists){
        return res.status(400).json({
            message: "email already exists."
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await adminModel.create({
        username,
        email,
        password: hashedPassword,
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token)


    res.status(201).json({
        message: "Admin User Created Successfully.",
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    })

    

    
}
async function loginAdminUser(req,res){
    const {email, password} = req.body;

    const user = await adminModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            message: "Unauthorized Access."
        })
    }

    const checkPassword = bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(400).json({
            message: "Unauthorized Access."
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    return res.status(201).json({
        message: "Admin User logged successfully.",
        user: {
            id : user._id,
            username: user.username,
            email: user.email,
        }
    })
}


module.exports = {
    registerUser,
    loginUser,
    registerAdminUser,
    loginAdminUser,

}