const express = require('express');
const bodyParser = require('body-parser');

const userDb = require('../db/userDb');
const auth = require('../utility/auth');

let router = express.Router();

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// checks if the current user is authenticated through the headers
let isAuthenticated = async (req, res, next) => {
    // get credentials from req header
    try {
        let email = req.headers.email || '', password = req.headers.password || '';
        let creds = await userDb.getUserCreds(email);
        if(!auth.authenticate(password, creds.hash, creds.salt)) {
            res.status(401).send('UNAUTHENTICATED!');
        } else {
            return next();
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('Error Authenticating!');
    }
};

/* USER API */
// authRouter.use(isAuthenticated);

router.get('/', async (req, res, next) => {
    let email = req.headers.email;
    let user = await userDb.getUser(email);
    res.send(user);
});

router.post('/', async (req, res) => {
    try {
        let newUser = req.body;
        let existing = await userDb.getUser(newUser.email)
        if(Object.keys(existing).length) {
            // user already exists
            throw 'User with email ' + newUser.email + ' already exists';
        } else {
            let newCreds = auth.saltHashPassword(newUser.password);
            let response = await userDb.addUser({
                'email' : newUser.email,
                'name' : newUser.name,
                'hash' : newCreds.hash,
                'salt' : newCreds.salt
            });
            console.log(response);
            res.send('Created user ' + newUser.email + ' successfully!');
        }
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.delete('/', isAuthenticated, async (req, res) => {
    try {
        let dbRes = await userDb.deleteUser(req.headers.email);
        console.log(dbRes);
        res.send('Deleted user ' + req.headers.email + ' successfully!');

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }

});

module.exports = router;