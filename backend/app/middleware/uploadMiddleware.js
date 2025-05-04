const multer = require('multer')
const path = require('path')

// configure storage
const storage = multer.diskStorage({
    destination : (req,file, cb) => {
        cb(null, 'uploads/');
    },
    filename : (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File Acceptance

const fileFilter = (req , file, cb) => {
    const allowedTypes = ['image/jpeg','image/png', 'image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error('only .jpeg .jpg and .png formats are allowed'),false);
    }
};

const upload = multer({
    storage:storage,
    fileFilter : fileFilter,
    // limits : { fileSize : 5 * 1024 * 1024 } // limit for file size
})

module.exports = upload;