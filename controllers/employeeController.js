const { db_company } = require("../config/db");

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

    return res.status(201).json({
      success: true,
      message: "Employee data successfully retrieved",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee data",
      data: [],
    });
  }
};

module.exports = { getEmployees };
