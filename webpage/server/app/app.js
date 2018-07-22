/**
 * TODO : comment on express
 */
const express = require('express');

/**
 * it is used so that both socketIO and express can run simultaneously
 * it is available in core library.
 */
const http = require('http');

/**
 * setting up express app
 */
const app = express();
/**
 * import user model and mongoose
 */
let {User} = require('../models/user');

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * It is used for parsing the data send by the clients.
 */
const bodyparser = require('body-parser');

/**
 * Public path defination
 */
const publicPath = path.join(__dirname, '../..', '/public'),
    views = path.join(__dirname, '../..', '/public/views');

/**
 * setting up middleware at public directory which is displayed in browser
 * in the main directory '/' file should be index.ejs
 */
app.use(express.static(publicPath));

/**
 * TODO: comment required for views folder
 */
app.set('views', views);

/**
 * TODO: comment required for view engine
 */
app.set('view engine', 'ejs');

/**
 * to parse json objects
 */
app.use(bodyparser.json());

/**
 * to parse post request or urlencoded data
 */
app.use(bodyparser.urlencoded({
    extended: true
}));

/**
 * created a http server to use express
 */
const server = http.createServer(app);

/**
 * get and post route of '/'
 * get is used for rendering the index.ejs file
 * post is used for authenticating of the user for login
 * and redirect to '/status' if success or to '/' if
 * failed
 */

app.get('/', (req, res) => {
    res.status(200).render('index',{title:'Drone | login'});
});

app.post('/', (req, res) => {
    User.findOne({
        username: req.body.username
    }, {
        _id: 1,
        password: 1,
        location:1,
        noOfUsers:1
    }).then((user) => {
        console.log(user);
        if ((user.length != 0) && (user.password === req.body.password) && (user.location === req.body.location)) {
            user.noOfUsers=1;
            user.save((err) => {
                if (err) {
                    return console.log("error in updating the number of users : " + err);
                }
                console.log("user successfully updated");
            });
            return res.status(200).redirect('/'+req.body.location);
        } else {
            console.log(`username or password incorrect`);
            return res.status(404).redirect('/');
        }
    });
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/default', (req, res) => {
    res.render('status',{href:"../datadefault.txt"});
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/nangi', (req, res) => {
    res.render('status', {href:"../dataNangi.txt"});
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/pulchowk', (req, res) => {
    res.render('status', {href: "../dataPulchowk.txt"});
});
/********************************************************************/

/**
 * to render the statusall.ejs in /stautsall
 */
app.get('/all', (req, res) => {
    res.render('statusall', {href: "../dataPulchowk.txt"});
});
/********************************************************************/

/**
 * for login in android
 */
app.post('/android', (req, res) => {
    console.log(req.body);
    User.findOne({
        username: req.body.username
    }, {
        _id: 1,
        password: 1,
        noOfUsers:1
    }).then((user) => {
        if ((user.length != 0) && (user.password === req.body.password)) {
            if (user.noOfUsers === 0) {
                user.noOfUsers=1;
                user.save((err) => {
                    if (err) {
                        return console.log("error in updating the number of users");
                    }
                    console.log("user successfully updated");
                });
                global.deviceNames = req.body.deviceName;
            }
            return res.send('OK');
        } else {
            console.log(`username or password incorrect`);
            return res.send('login failed');
        }
    });
});
/********************************************************************/


module.exports = server;