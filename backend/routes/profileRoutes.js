const express = require('express');
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/upload', upload.single('profileImage'), profileController.uploadProfileImage);

module.exports = router;
