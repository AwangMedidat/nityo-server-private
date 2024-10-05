const express = require('express');
const employeeRoutes = require('./employeeRoutes');

const router = express.Router();

router.use('/employees', employeeRoutes); 

module.exports = router;
