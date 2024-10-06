const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const transactionRotes = require('./transactionRoute')
const router = express.Router();

router.use('/list_employee', employeeRoutes); 
router.use('/post_data', transactionRotes)

module.exports = router;
