const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db_company } = require('../config/db');

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);        

        const result = await db_company.query(
            'INSERT INTO tbl_user (username, password) VALUES ($1, $2) RETURNING user_id, username',
            [username, hashedPassword]
        );

        res.status(201).json({success: true, message: 'Pengguna berhasil didaftarkan', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: 'Gagal mendaftarkan pengguna', data: {} });
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const result = await db_company.query('SELECT * FROM tbl_user WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {            
            return res.status(401).json({ success: false, message: 'Username atau password salah', data: {} });
        }
  

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Username atau password salah', data: {} });
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ success: true, message: 'Login Berhasil', data: { user: username, token } });
    } catch (error) {
        res.status(500).json({success: false, message: 'Gagal login', data: {} });
    }
    
};

module.exports = { login, register };
