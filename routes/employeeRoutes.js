const express = require('express');
const { postEmployee, getEmployees } = require('../controllers/employeeController');

const router = express.Router();

router.post('/post_employee', postEmployee)
router.get('/list_employee', getEmployees);

module.exports = router;
