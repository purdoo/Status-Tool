const mysql = require('mysql');

let host = process.env.DB_HOST || 'localhost';
let pass = process.env.DB_PASS || '';

let connection = mysql.createConnection({
    host     : host,
    user     : 'root',
    password : pass,
    database : 'status'
});

// returns user info without credentials
exports.getUser = (email) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `Users` WHERE `email` = ?', [email], function (error, results) {
            if (error) reject(error);
            else if (results === undefined || results.length === 0) resolve({});
            else resolve({'user_id': results[0].user_id, 'email' : results[0].email, 'name' : results[0].name});
        });
    });
};

// used for verification/auth, returns credentials as well
exports.getUserCreds = (email) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `Users` WHERE `email` = ?', [email], function (error, results) {
            if (error) reject(error);
            else if (results === undefined || results.length === 0) reject('User not found!');
            else resolve({'user_id': results[0].user_id,'hash' : results[0].hash, 'salt' : results[0].salt});
        });
    });
};

exports.addUser = (user) => {
    return new Promise((resolve, reject) => {
        let query = 'INSERT INTO `Users` (`email`, `name`, `hash`, `salt`) VALUES (?, ?, ?, ?)';
        connection.query(query, [user.email, user.name, user.hash, user.salt], function (error, results) {
            if (error) reject(error);
            resolve(results);
        });
    });
};

exports.deleteUser = (email) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM `Users` WHERE `email` = ?', [email], function (error, results) {
            if (error) reject(error);
            resolve(results);
        });
    });
};
