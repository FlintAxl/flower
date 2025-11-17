const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateProfile,
    updatePassword,
    allUsers,
    getUserDetails,
    updateUser,
    createUserByAdmin,
    bulkDeleteUsers,
    toggleUserStatus,
} = require('../controllers/auth');

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.post('/register', upload.single("avatar"), registerUser);
router.post('/login', loginUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/me',  isAuthenticatedUser, getUserProfile)
router.put('/me/update', isAuthenticatedUser,  upload.single("avatar"), updateProfile)
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), allUsers)
router.post('/admin/user/new', isAuthenticatedUser, authorizeRoles('admin'), createUserByAdmin)
router.delete('/admin/users/bulk', isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteUsers)
router.put('/admin/user/:id/toggle-status', isAuthenticatedUser, authorizeRoles('admin'), toggleUserStatus)
router.route('/admin/user/:id').get(isAuthenticatedUser, getUserDetails).put(isAuthenticatedUser, updateUser)
module.exports = router;