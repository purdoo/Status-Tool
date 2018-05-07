const express = require('express');
const bodyParser = require('body-parser');

const userDb = require('../db/userDb');
const auth = require('../utility/auth');

let router = express.Router();

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const Validator = require('jsonschema').Validator;
let v = new Validator();

const bodySchema = require('../db/schema/newUserBody.json');

/* Routing Middleware */

// checks to see if the headers for the req are properly set (present)
let validHeaders = (req, res, next) => {
    // check for email header
    if (req.headers.email) return next();
    else res.status(400).send('Invalid Headers')
};

// checks if the current user is authenticated through the headers
let isAuthenticated = async (req, res, next) => {
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

// validate the request body (POST and PUT)
let validPostPayload = (req, res, next) => {
    if(v.validate(req.body, bodySchema).errors.length) {
        res.status(400).send('Invalid Request Body');
    } else {
        return next();
    }
};

/* USER API */
router.post('/', validPostPayload, async (req, res) => {
    try {
        let newUser = req.body;
        let existing = await userDb.getUser(newUser.email);
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
        res.status(400).send('Error creating user!');
    }
});

router.post('/login', async (req, res) => {
    try {
        let loginUser = req.body;
        let existingUserCreds = await userDb.getUserCreds(loginUser.email);
        if(auth.authenticate(loginUser.password, existingUserCreds.hash, existingUserCreds.salt)) {
            res.send({ userId: existingUserCreds.user_id, email: loginUser.email });
        } else {
            res.status(401).send('UNAUTHENTICATED!');
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('Error logging in!');
    }
});

router.use(validHeaders);

router.get('/', async (req, res) => {
    let email = req.headers.email;
    let user = await userDb.getUser(email);
    res.send(user);
});

router.delete('/', isAuthenticated, async (req, res) => {
    try {
        let dbRes = await userDb.deleteUser(req.headers.email);
        console.log(dbRes);
        res.send('Deleted user ' + req.headers.email + ' successfully!');

    } catch (err) {
        console.log(err);
        res.status(400).send('Error deleting user!');
    }

});

module.exports = router;