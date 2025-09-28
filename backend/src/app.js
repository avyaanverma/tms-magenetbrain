// start server
const express = require("express")
const authRoutes = require("./routes/auth.routes")
const orgRoutes = require("./routes/organisation.routes")
const taskRoutes = require("./routes/task.routes")

const app = express();
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.use(express.json());

app.get('/', (req,res)=>{
    return res.json({
        message: "Server running successfully."
    })
})

app.use("/api/auth", authRoutes)
app.use("/api/organisation", orgRoutes)
app.use("/api/task/", taskRoutes)

module.exports = app