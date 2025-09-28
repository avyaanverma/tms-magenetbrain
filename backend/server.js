// start server
require("dotenv").config()
const connectDB = require("./src/db/db")
const server = require("./src/app");
// const connectDB = require("./src/db/db")

console.log(process.env.BACKEND_PORT)
connectDB()
server.listen(process.env.BACKEND_PORT, ()=>{
    console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
})