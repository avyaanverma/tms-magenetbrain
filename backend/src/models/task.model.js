const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    status : {
        type: String, 
        enum: ["pending", "completed"],
        default: "pending"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organisation"
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"admin"
    }
},{
   timestamps:true 
})

const taskModel = new mongoose.model("task", taskSchema)
module.exports = taskModel