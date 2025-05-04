const express = require('express');
const userCltr = require('../app/controllers/authCltr');
const authenticateUser = require('../app/middleware/authentication');
const upload = require('../app/middleware/uploadMiddleware');
const router = express.Router();

router.get('/account', authenticateUser, userCltr.getUserInfo)
router.post('/register', userCltr.registerUser );
router.post('/login', userCltr.loginUser );
router.post('/upload-image', upload.single('image'), (req,res) => {
    if(!req.file){
        return res.status(400).json({message : 'No file uploaded'});
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({imageUrl});
});


module.exports = router