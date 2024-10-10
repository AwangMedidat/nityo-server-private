const fs = require("fs");
const csvParser = require("csv-parser");
const { db_transaction, db_log, db_company } = require("../config/db");
const { calculateFee } = require("./feeLogic");

const postTransaction = async (req, res) => {
  const logData = {
    total_record: 0,
    total_record_faild: 0,
    total_record_succes: 0,
    faild_id_notes: [],
    csv_filename: req.file.originalname,
    upload_date: new Date(),
  };

  try {
    const csvFilePath = req.file.path;
    console.log(`CSV file path: ${csvFilePath}`); // Logging path file CSV

    const promises = [];

    // Baca CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => {
        console.log("Processing row:", row); // Logging setiap baris yang diproses

        promises.push(
          (async () => {
            logData.total_record++;
            const { employee_id, Amount, tgl_transaksi } = row;

            if (!employee_id || !Amount || !tgl_transaksi) {
              console.log(`Missing data in row: ${JSON.stringify(row)}`); // Logging jika ada field kosong
              logData.total_record_faild++;
              logData.faild_id_notes.push(employee_id || "Unknown");
              return;
            }

            try {
              console.log(`Checking employee ID: ${employee_id}`); // Logging pengecekan employee ID
              const employee = await db_company.query(
                "SELECT * FROM tbl_employee WHERE employee_id = $1",
                [employee_id]
              );

              if (employee.rowCount > 0) {
                console.log(
                  `Employee ${employee_id} found, processing transaction.`
                ); // Logging jika employee ditemukan

                logData.total_record_succes++;

                await db_transaction.query(
                  "INSERT INTO tbl_transaksi (employee_id, amount, tgl_transaksi) VALUES ($1, $2, $3)",
                  [employee_id, Amount, tgl_transaksi]
                );

                const fee = await calculateFee(employee_id, Amount);
                // await db_transaction.query(
                //   'INSERT INTO tbl_fee (employee_id, amount_fee, tgl_fee) VALUES ($1, $2, $3)',
                //   [employee_id, fee, new Date()]
                // );

                console.log(
                  `Transaction for employee ${employee_id} successfully inserted.`
                ); // Logging sukses insert transaksi
              } else {
                console.log(
                  `Employee ${employee_id} not found, transaction failed.`
                ); // Logging jika employee tidak ditemukan
                logData.total_record_faild++;
                logData.faild_id_notes.push(employee_id);
              }
            } catch (err) {
              console.error(
                `Error during transaction for employee_id ${employee_id}:`,
                err.message
              );
              logData.total_record_faild++;
              logData.faild_id_notes.push(employee_id);
            }
          })()
        );
      })
      .on("end", async () => {
        console.log("All rows processed, waiting for promises to finish."); // Logging saat semua data selesai diproses
        await Promise.all(promises);

        console.log("Inserting log data into log_transaksi table."); // Logging insert log ke database
        await db_log.query(
          "INSERT INTO log_transaksi (csv_filename, total_record, total_record_faild, total_record_succes, faild_id_notes, upload_date) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            logData.csv_filename,
            logData.total_record,
            logData.total_record_faild,
            logData.total_record_succes,
            logData.faild_id_notes.join(","),
            logData.upload_date,
          ]
        );

        res.status(200).json({
          success: true,
          message: "File processed successfully",
          log: logData,
        });
      })
      .on("error", (error) => {
        console.error("Error while reading CSV file:", error.message);
        res
          .status(500)
          .json({
            success: false,
            message: "Error while processing CSV file",
            error: error.message,
          });
      });
  } catch (err) {
    console.error("File processing failed:", err.message);
    res.status(500).json({
      success: false,
      message: "File processing failed",
      error: err.message,
    });
  }
};

module.exports = { postTransaction };
