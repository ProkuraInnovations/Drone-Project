/**
 * TODO: how to use HTTP /2 protocol
 */

/**
 * configuration of database is stored in config file
 */
require('./config/config');
global.deviceNames = 4;

/**
 * server require
 */
const server = require('./app/app');

/********************************************************************/

/**
 * setting the port at which the server run
 */
const port = process.env.PORT || 8081;

require('./socketio/defaultSocket');
require('./socketio/pulchowkSocket');
require('./socketio/nangiSocket');
/********************************************************************/

/**
 * setting up a server at port 3000 or describe by process.env.PORT
 */
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});
