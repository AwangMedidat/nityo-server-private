const express = require('express');
const multer = require('multer');
const { postTransaction } = require('../controllers/transactionController');

const router = express.Router();

// Setup multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original filename
    }
});

const upload = multer({ storage: storage });

// Route to handle CSV file upload and processing
router.post('/', upload.single('csv_file'), postTransaction);

module.exports = router;
