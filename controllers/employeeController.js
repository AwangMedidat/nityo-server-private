const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db_company } = require('../config/db');

const postEmployee = async (req, res) => {
    const { employeeName, employeeManagerId } = req.body;

    try {
        let result

        if (employeeName === '') {
            return res.status(400).json({ success: false, message: 'Employee Name is required' });
        } else if (employeeManagerId === '') {
            result = await db_company.query(
                'INSERT INTO tbl_employee (employee_name, employee_manager_id) VALUES ($1, $2)',
                [employeeName, null]
            );
        } else {
            // const managerQuery = await db_company.query(
            //     'SELECT employee_id, employee_name, path_level FROM tbl_employee WHERE employee_id = $1',
            //     [+employeeManagerId]
            // );

            // if (managerQuery.rowCount === 0) {
            //     return res.status(400).json({ success: false, message: 'Manager not found', data: {} });
            // }

            // const manager = managerQuery.rows[0];
            // const managerId = manager.employee_id;
            // const managerName = manager.employee_name;
            // const managerPathLevel = manager.path_level;
            // const newPathLevel = managerPathLevel + 1;
            // let spaces = '';
            // if (newPathLevel > 1) {
            //     spaces = ' '.repeat((newPathLevel - 1) * 3);
            // }
            // const employeeFormat = `${spaces}|__${employeeName}`;
            // let arrHierarchy = [];
            // let tempEmployeeManagerId = +employeeManagerId;

            // while (tempEmployeeManagerId) {
            //     let dataTempmanager = await db_company.query(
            //         'SELECT employee_manager_id, employee_name FROM tbl_employee_1 WHERE employee_id = $1',
            //         [tempEmployeeManagerId]
            //     );

            //     if (dataTempmanager.rows.length === 0) break;

            //     let idManager = dataTempmanager.rows[0].employee_manager_id;
            //     let managerName = dataTempmanager.rows[0].employee_name;

            //     arrHierarchy.push(managerName);
            //     tempEmployeeManagerId = idManager;
            // }

            // arrHierarchy.reverse();
            // arrHierarchy.push(employeeName);

            // const pathHierarchy = arrHierarchy.join('->');

            // console.log(arrHierarchy);
            

            result = await db_company.query(
                'INSERT INTO tbl_employee (employee_name, employee_manager_id) VALUES ($1, $2)',
                [employeeName, +employeeManagerId]
            );
        }

        return res.status(201).json({ success: true, message: 'Succesfully submit employee' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed submit employee' });
    }
};


const getEmployees = async (req, res) => {

    try {
        const query = `
            WITH RECURSIVE hierarchy AS (
                SELECT 
                    employee_id, 
                    employee_name, 
                    employee_manager_id, 
                    0 AS path_level, 
                    employee_name::character varying AS employee_format, 
                    employee_name::character varying AS path_hierarchy 
                FROM tbl_employee 
                WHERE employee_manager_id IS NULL
                
                UNION ALL
                
                SELECT 
                    e.employee_id, 
                    e.employee_name, 
                    e.employee_manager_id, 
                    h.path_level + 1, 
                    CONCAT(REPEAT('    ', h.path_level + 1), '|__', e.employee_name) AS employee_format, 
                    CONCAT(h.path_hierarchy, '->', e.employee_name) AS path_hierarchy
                FROM tbl_employee AS e
                JOIN hierarchy h ON e.employee_manager_id = h.employee_id
            )
            SELECT 
                employee_id, 
                employee_name, 
                employee_manager_id, 
                path_level, 
                employee_format, 
                path_hierarchy 
            FROM hierarchy
            ORDER BY employee_id;
        `;

        const result = await db_company.query(query);
        const data = result.rows;

        return res.status(201).json({ success: true, message: 'Employee data successfully retrieved', data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve employee data', data: [] });
    }

};


module.exports = { postEmployee, getEmployees };
