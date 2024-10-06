const express = require('express');
const { postEmployee, getEmployees } = require('../controllers/employeeController');

const router = express.Router();

router.get('/', getEmployees);

module.exports = router;
