const { db_transaction, db_company } = require('../config/db');

const calculateFee = async (employeeId, amount) => {
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
        WHERE employee_id = $1
        ORDER BY employee_id;
    `;

        const result = await db_company.query(query, [employeeId]);
        const data = result.rows;

        let fee = +amount / (data[0].path_level + 1)
        let tempEmployeeId = +employeeId
        while (data[0].path_level + 1) {
                let dataTempmanager = await db_company.query(
                    'SELECT employee_manager_id, employee_name, employee_id FROM tbl_employee WHERE employee_id = $1',
                    [tempEmployeeId]
                );

                if (dataTempmanager.rows.length === 0) break;
                await db_transaction.query(
                    'INSERT INTO tbl_fee (employee_id, amount_fee, tgl_fee) VALUES ($1, $2, $3)',
                    [tempEmployeeId, fee, new Date()]
                );

                let idManager = dataTempmanager.rows[0].employee_manager_id;

                tempEmployeeId = idManager;
            }

        return true;
    } catch (error) {
        console.log(error.message);

        throw new Error(`Error calculating fee for employee ${employeeId}: ${error.message}`);
    }
};

module.exports = { calculateFee };
