const fs = require('fs');
const csvParser = require('csv-parser');
const { db_transaction, db_log, db_company } = require('../config/db');
const { calculateFee } = require('./feeLogic');

const postTransaction = async (req, res) => {
    const logData = {
        total_record: 0,
        total_record_faild: 0,
        total_record_succes: 0,
        faild_id_notes: [],
        csv_filename: req.file.originalname,
        upload_date: new Date()
    };

    try {
        const csvFilePath = req.file.path;

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: ';' }))
            .on('data', async (row) => {
                logData.total_record++;
                const { employee_id, Amount, tgl_transaksi } = row;

                const employee = await db_company.query('SELECT * FROM tbl_employee WHERE employee_id = $1', [employee_id]);

                if (employee.rowCount > 0) {
                    await db_transaction.query(
                        'INSERT INTO tbl_transaksi (employee_id, amount, tgl_transaksi) VALUES ($1, $2, $3)',
                        [employee_id, Amount, tgl_transaksi]
                    );

                    const fee = await calculateFee(employee_id, Amount);
                    // await db_transaction.query(
                    //     'INSERT INTO tbl_fee (employee_id, amount_fee, tgl_fee) VALUES ($1, $2, $3)',
                    //     [employee_id, fee, new Date()]
                    // );

                    logData.total_record_succes++;
                } else {
                    logData.total_record_faild++;
                    logData.faild_id_notes.push(employee_id);
                }
            })
            .on('end', async () => {
                await db_log.query(
                    'INSERT INTO log_transaksi (csv_filename, total_record, total_record_faild, total_record_succes, faild_id_notes, upload_date) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        logData.csv_filename,
                        logData.total_record,
                        logData.total_record_faild,
                        logData.total_record_succes,
                        logData.faild_id_notes.join(','),
                        logData.upload_date
                    ]
                );

                res.status(200).json({ success: true, message: 'File processed successfully', log: logData });
            });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'File processing failed',
            error: err.message
        });
    }
};

module.exports = { postTransaction };
