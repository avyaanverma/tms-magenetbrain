const express = require("express")
const orgController = require('../controllers/organisation.controller')
const authMiddleware = require("../middlewares/auth.middleware")


const router = express.Router()
/*
POST /api/organisations → create organisation

GET /api/organisations/:id → get details

PUT /api/organisations/:id → update org

DELETE /api/organisations/:id

POST /api/organisations/:id/addUser

*/
router.get('/',
     authMiddleware.authAdminMiddleware, 
     orgController.getOrganisations
    )

router.post('/create',
    authMiddleware.authAdminMiddleware ,
    orgController.createOrganisation)

router.get('/:id',
    authMiddleware.authAdminMiddleware, 
    orgController.getOrganisationById)

router.put('/:id', 
    authMiddleware.authAdminMiddleware,
    orgController.updateOrganisation)

router.delete('/:id', 
    authMiddleware.authAdminMiddleware,
    orgController.deleteOrganisation)

router.post('/:id/add-user', 
    authMiddleware.authAdminMiddleware,
    orgController.addMember)

router.post('/:id/delete-user', 
    authMiddleware.authAdminMiddleware,
    orgController.removeMember  )


module.exports = router

