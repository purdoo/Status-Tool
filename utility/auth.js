'use strict';

const crypto = require('crypto');

exports.saltHashPassword = (password) => {
    let salt = genRandomString(16);
    return sha512(password, salt);
};

exports.authenticate = (password, hash, salt) => {
    let requestHash = sha512(password, salt);
    return (requestHash.hash === hash);
};

let genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
};

let sha512 = function(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let hashValue = hash.digest('hex');
    return {
        salt: salt,
        hash: hashValue
    };
};