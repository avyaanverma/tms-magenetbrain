const Task = require('../models/task.model');
const Organisation = require('../models/organisation.model');
const Admin = require('../models/admin.model');
const User = require('../models/user.model');

async function createTask(req, res) {
    const { title, description, assignedTo, dueDate } = req.body;
    let {priority} = req.body;
    const {organisation} = req.body
    if (!title || !description || !assignedTo || !dueDate || !organisation) {
            return res.status(400).json({ 
                message: "All fields (title, description, assignedTo, dueDate, organisation) are required" 
            });
    }

    const adminId = req.admin._id;
    const org = await Organisation.findOne({ _id: organisation, createdBy: adminId });


    if (!org) {
            return res.status(403).json({ 
                message: "Organisation not found or you don't have permission to create tasks for this organisation" 
            });
    }


    if (new Date(dueDate) <= new Date()) {
        return res.status(400).json({ 
            message: "Due date must be in the future" 
        });
    }

    const assignedUser = await User.findOne({ 
            _id: assignedTo, 
    });

    if (!assignedUser) {
        return res.status(400).json({ 
            message: "Assigned user not found or doesn't belong to this organisation" 
        });
    }

    priority = priority ? priority.toLowerCase() : "medium";

    const task = new Task({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        assignedTo,
        status: "pending",
        priority: priority,
        organisation: org._id,
        createdBy: adminId
    });

    await task.save();
    // Populate the task with user details for response
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ 
        message: "Task created successfully", 
        task 
    });
}

async function getAllTasks(req,res){
    const adminId = req.admin._id;
    const tasks = await Task.find({createdBy: adminId}).populate('assignedTo', 'username email');
    res.status(200).json({
        message: "Tasks fetched successfully",
        tasks
    });
}

// GET /api/tasks/my (User only)
async function getMyTasks(req, res) {
    if (!req.user) {
        return res.status(403).json({ message: "Only users can fetch their tasks" });
    }

    const tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email')
        .populate('organisation', 'title description');
        
    return res.status(200).json({ tasks });
}

// GET /api/tasks/:id (Admin or User)
async function getTaskById(req, res) {
    const task = await Task.findById(req.params.id).populate("assignedTo", "username email");

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    if (req.admin || (req.user && task.assignedTo.toString() === req.user._id.toString())) {
        return res.status(200).json({ task });
    }

    return res.status(403).json({ message: "Not authorized" });
}

// PUT /api/tasks/:id (Admin → full update, User → only status)
async function updateTask(req, res) {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    if (req.admin) {
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.status = req.body.status || task.status;
    } else if (req.user) {
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }
        // user can only update status
        task.status = req.body.status || task.status;
    } else {
        return res.status(403).json({ message: "Unauthorized" });
    }

    await task.save();
    return res.status(200).json({ message: "Task updated", task });
}

// DELETE /api/tasks/:id (Admin only)
async function deleteTask(req, res) {
    if (!req.admin) {
        return res.status(403).json({ message: "Only admins can delete tasks" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted" });
}

module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    deleteTask
};