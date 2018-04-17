const mysql = require('mysql');

let host = process.env.DB_HOST || 'localhost';
let pass = process.env.DB_PASS || '';

let connection = mysql.createConnection({
    host     : host,
    user     : 'root',
    password : pass,
    database : 'status'
});

exports.getAllStatus = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `Status`', function (error, results) {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

// exports.getStatus = (statusId) => {
//     return new Promise((resolve, reject) => {
//         connection.query('SELECT * FROM `Status` WHERE `status_id` = ?', [statusId], function (error, results) {
//             if (error) reject(error);
//             else if (results === undefined || results.length === 0) resolve({});
//             else resolve(results[0]);
//         });
//     });
// };

exports.getUserStatus = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `Status` WHERE `user_id` = ?', [userId], function (error, results) {
            if (error) reject(error);
            else if (results === undefined || results.length === 0) resolve({});
            else resolve(results);
        });
    });
};

exports.addStatus = (status) => {
    return new Promise((resolve, reject) => {
        let query = 'INSERT INTO `Status` (`user_id`, `body`) VALUES (?, ?)';
        connection.query(query, [status.user_id, status.body], function (error, results) {
            if (error) reject(error);
            resolve(results);
        });
    });
};

exports.deleteStatus = (email) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM `Users` WHERE `email` = ?', [email], function (error, results) {
            if (error) reject(error);
            resolve(results);
        });
    });
};
