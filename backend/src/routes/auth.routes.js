const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router();

// User Routes
router.post("/user/register",
    authController.registerUser)

router.post("/user/login", 
    authController.loginUser)

// Admin Routes
router.post("/admin/register", 
    authController.registerAdminUser)
    
router.post("/admin/login", 
    authController.loginAdminUser)

module.exports = router