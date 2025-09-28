const express = require("express")
const taskController = require("../controllers/task.controller")
const authMiddleware = require("../middlewares/auth.middleware")


const router = express.Router()
/*
POST /api/tasks → create task

GET /api/tasks → get all tasks (admin)

GET /api/tasks/my → get tasks assigned to logged-in user

GET /api/tasks/:id

PUT /api/tasks/:id

DELETE /api/tasks/:id

*/

// admin routes
router.post('/create',
    authMiddleware.authAdminMiddleware ,
    taskController.createTask
)

router.get('/',
    authMiddleware.authAdminMiddleware, 
    taskController.getAllTasks
)

router.delete("/deleteTask/:id", 
    authMiddleware.authAdminMiddleware, 
    taskController.deleteTask
);

// user routes
router.get('/my',
    authMiddleware.authUserMiddleware,
    taskController.getMyTasks
 )

// shared routes
router.get('/:id',
    authMiddleware.authAdminOrUser, 
    taskController.getTaskById)

router.put("/tasks/:id",
    authMiddleware.authAdminOrUser, 
    taskController.updateTask);

module.exports = router
