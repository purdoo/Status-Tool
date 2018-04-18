const express = require('express');
const bodyParser = require('body-parser');

const userDb = require('../db/userDb');
const statusDb = require('../db/statusDb');
const auth = require('../utility/auth');

let router = express.Router();

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const Validator = require('jsonschema').Validator;
let v = new Validator();

const headerSchema = require('../db/schema/newStatusHeaders.json');
const bodySchema = require('../db/schema/newStatusBody.json');

/* Routing Middleware */

// checks if the current user is authenticated through the headers
let isAuthenticated = async (req, res, next) => {
    // get credentials from req header
    try {
        let email = req.headers.email || '', password = req.headers.password || '';
        let creds = await userDb.getUserCreds(email);

        if(!auth.authenticate(password, creds.hash, creds.salt)) { // check if user is authenticated
            res.status(401).send('Unauthenticated!');
        } else if (req.body.user_id !== creds.user_id) { // check if user is providing the correct FK user_id
            res.status(400).send('Creating status for wrong user!');
        } else {
            return next();
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('Error Authenticating!');
    }
};

// checks to see if the headers for the req are properly set (present)
let validHeaders = (req, res, next) => {
    // check for email header
    if(v.validate(req.headers, headerSchema).errors.length) res.status(400).send('Invalid Headers');
    else return next();
};

// validate the request body (POST)
let validPostPayload = (req, res, next) => {
    // console.log(v.validate(req.body, bodySchema));
    if(v.validate(req.body, bodySchema).errors.length) {
        res.status(400).send('Invalid Request Body');
    } else {
        return next();
    }
};


/* Routing Logic */

// does not require user to be authenticated
router.get('/', async (req, res) => {
    try {
        let statuses = await statusDb.getAllStatus();
        res.send(statuses);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.get('/:userId', async (req, res) => {
    let userStatuses = await statusDb.getUserStatus(req.params.userId);
    res.send(userStatuses);
});

// subsequent routes require valid headers params and proper authentication
router.use(validHeaders);
router.use(isAuthenticated);

router.post('/', validPostPayload, async (req, res) => {
    try {
        let newStatus = req.body;
        let dbRes = await statusDb.addStatus(newStatus);
        console.log(dbRes);
        res.send('Created status!');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.delete('/', async (req, res) => {
    try {
        res.send('Deleted status (TODO)');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

module.exports = router;