const mongoose = require("mongoose")

const organisationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
},{
    timestamps: true
})

const organisationModel = new mongoose.model("organisation", organisationSchema)
module.exports = organisationModel