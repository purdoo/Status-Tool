const express = require('express');
const bodyParser = require('body-parser');

const userDb = require('../db/userDb');
const statusDb = require('../db/statusDb');
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

// does not require user to be authenticated
router.get('/', async (req, res) => {
    try {
        let statuses = await statusDb.getAllStatus();
        console.log(statuses);
        res.send(statuses);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

router.get('/:userId', async (req, res) => {
    let userId = req.params.userId;
    let userStatuses = await statusDb.getUserStatus(userId);
    res.send(userStatuses);
});

// subsequent routes require authentication
router.use(isAuthenticated);

router.post('/', async (req, res) => {
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

module.exports = router;