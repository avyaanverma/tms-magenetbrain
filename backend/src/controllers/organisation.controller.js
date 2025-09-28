const adminModel = require("../models/admin.model")
const organisationModel = require("../models/organisation.model")
const userModel = require("../models/user.model")
/*
POST /api/organisations → create organisation

GET /api/organisations/:id → get details

PUT /api/organisations/:id → update org

DELETE /api/organisations/:id

POST /api/organisations/:id/addUser

*/



async function createOrganisation(req, res){
    const {title, description} = req.body

    const isOrgExists = await organisationModel.findById(req.admin.id)
    if(isOrgExists) {
        return res.json(400).json({
            message: "organisation already exits"
        })
    }
    const organisation = await organisationModel.create({
        title,
        description,
        createdBy: req.admin.id,
        members: []
    })

    res.status(201).json({
        organisation:{
            title: organisation.title,
            descriptio: organisation.description,
            createdBy: req.admin._id,
            members:[req.admin._id]
        }
    })
}

// route for specific admin and the organisations under the admin everyone can come here 
async function getOrganisations(req, res){
    const adminId = req.admin._id

    const allOrganisations = await organisationModel.find({
        createdBy : adminId
    })

    res.status(201).json({
        message: "All organisations fetched success.",
        organisations: allOrganisations
    })
}

async function getOrganisationById(req,res){
    const id = req.params.id

    const organisation = await organisationModel.findById(id)
        .populate("createdBy", "username email")
        .populate("members")


    if(!organisation){
        return res.status(404).json({
            message: `No Organisation found with id ${id}`
        })
    }

    res.status(200).json({
        message: "Organisation fetched Success.",
        organisation: organisation
    })


}


async function updateOrganisation(req,res){
    const id = req.params.id

    const {title, description} = req.body

    const organisation = await organisationModel.findByIdAndUpdate(
        id,
        { title, description },
        { new: true}
    )

    if(!organisation){
        return res.status(404).json({
            message: "Organisation Not Found 404",
        })
    }

    return res.status(200).json({
        message: "Organisation has been updated",
        organisation: organisation
    })
}

async function deleteOrganisation(req,res){
    const id = req.params.id

    const org = await organisationModel.findByIdAndDelete(id)

    if (!org) {
            return res.status(404).json({ message: "Organisation not found" });
    }

     res.json({ message: "Organisation deleted successfully" });
}

async function addMember(req,res){
    const {userId} = req.body
    const organisation = await organisationModel.findById(req.params.id)
    
    const user = await userModel.findById(userId);
    if(!user){
        return res.status(400).json({
            messag: "User Not Found"
        })
    }

    if(!organisation){
        return res.status(404).json({
            message: "Organisation Not Found."
        })
    }

    if(organisation.members.includes(userId)){
        return res.status(400).json({message: "Member already exists."})
    }

    organisation.members.push(userId);

    await organisation.save()

    res.status(200).json({
        message: "Member added Success",
        organisation : organisation
    });
}

async function removeMember(req,res){
    const {userId} = req.body
    const organisation = await organisationModel.findById(req.params.id)
    
    const user = await userModel.findById(userId);
    if(!user){
        return res.status(400).json({
            messag: "User Not Found"
        })
    }

    if(!organisation){
        return res.status(404).json({
            message: "Organisation Not Found."
        })
    }

    if(!organisation.members.includes(userId)){
        return res.status(400).json({message: "Member doesn't exist."})
    }

    organisation.members.pop(userId);

    await organisation.save()

    res.status(200).json({
        message: "Member removed Successfully.",
        organisation : organisation
    });
}

module.exports = {
    createOrganisation,
    getOrganisations,
    getOrganisationById,
    updateOrganisation,
    deleteOrganisation,
    addMember,
    removeMember
}