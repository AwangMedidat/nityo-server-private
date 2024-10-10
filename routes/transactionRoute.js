const express = require("express");
const multer = require("multer");
const { postTransaction } = require("../controllers/transactionController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("csv_file"), postTransaction);

module.exports = router;
