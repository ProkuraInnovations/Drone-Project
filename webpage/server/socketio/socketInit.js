/**
 * configuring server to use socket io , websocket first and long polling second
 */
/*const io = socketIO(server, {
    transports: ['websocket','polling']
});*/

/**
 * It is used for websocket connections between the client
 */
const socketIO = require('socket.io');

/**
 * server require
 */
const server = require('../app/app');

/**
 * io for accessing the socket functionality
 */
let io = socketIO(server);

module.exports = io;