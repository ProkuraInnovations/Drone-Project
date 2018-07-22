/**
 * import mongoose to connect database
 * Dorne database schema
 */
let {mongoose} = require('../db/mongoose');
let {DroneData} = require('../models/droneData');

/**
 * require io
 */
const io = require('./socketInit');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let Android = [],
    Website = [],
    Pi = [],
    lat,
    lng,
    deviceMission,
    setTimeoutObject= [];

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/mission.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmission.txt'),
    datafile = path.join(__dirname, '../..', '/public/datadefault.txt');
/********************************************************************/

/**
 * to confirm the connection status with the client
 */
io.on('connection', (socket) => {

    /**
     * to join the particular devices
     * joinPi to join the socket of pi
     * joinWebsite to join the socket of website
     * joinAndroid to join the socket of android
     */
    socket.on('joinPi', () => {
        Pi.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi) connected`);
    });

    socket.on('joinWebsite', () => {
        Website.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website) connected`);
        // console.log(socket.nsp.server.eio.clients);
    });

    socket.on('joinAndroid', () => {
        Android.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android device) connected`);
    });
    /******************** Join device completed *************************/

    /**
     * This socket is listening to pi socket which relayed the message
     * to android socket about the success of auto arm of copter.
     */
    socket.on('success', (msg) => {
        io.to('android').emit('success', msg);
    });
    /********************************************************************/

    /**
     * This socket is listening to pi socket for the continuous data of
     * copter about the state and positions.
     * And the received data are relayed to the website for Graphical view
     * Also the data is store in the mongodb database
     */
    socket.on('data', (data) => {
        let dataArranged = {
            lat: data.lat || 0,
            lng: data.lng || 0,
            altr: data.altr || 0,
            alt: data.alt || 0,
            numSat: data.numSat || 0,
            hdop: data.hdop || 0,
            fix: data.fix || 0,
            head: data.head || 0,
            gs: data.gs || 0,
            as: data.as || 0,
            mode: data.mode || "UNKNOWN",
            arm: data.arm || "FALSE",
            ekf: data.ekf || "FALSE",
            status: data.status || "UNKNOWN",
            lidar: data.lidar || 0,
            volt: data.volt || 0,
            est: data.est || 0,
            conn: data.conn || "FALSE"
        };
        io.to('android').to('website').emit('copter-data',dataArranged);
        lat = data.lat;
        lng = data.lng;
        let droneData = new DroneData(dataArranged);
        droneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved :' + e );
        });
    });
    /********************************************************************/

    /**
     * This socket is listening to pi socket for the home lat and lng of
     * the copter after the gps lock has been established in the copter.
     * And the received home location is emitted to the website
     */
    socket.on('homePosition', (homeLocation) => {
        io.to('website').emit('homePosition', homeLocation);
    });
    /********************************************************************/

    /**
     * This socket is listening for the error messages send by the clients
     * (pi and android) the error message is received in the format of
     * {'context': 'something', 'msg':'something'}
     * The error message is send to the website and the context is used
     * for determining the task to be done before sending to the website
     */
    socket.on('errors', (error) => {
        io.to('website').emit('error', error.msg);
        if (error.context === 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                io.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context === 'Prearm') {
            io.to('android').emit('success', error.msg);
        } else if (error.context === 'Connection') {
            io.to('android').emit('success', error.msg);
        }
    });
    /********************************************************************/

    /**
     * This socket is listening to pi for the way-points of mission
     * and the way-points are send to the website for display and save to
     * the file called 'actualmissionfile'
     */
    socket.on('waypoints', (waypoints) => {
        console.log(waypoints);
        if (deviceMission === "android") {
            io.to('android').emit('Mission',waypoints);
        } else if (deviceMission === "website") {
            io.to('website').emit('Mission',waypoints);
        }
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });
    /********************************************************************/

    /**
     * This socket is listening to website client for requesting the pi to
     * download the mission file.
     * In the process the actualmissionfile is renamed to renamedmissionfile
     * so to differentiate the new and old mission file.
     * And the request is emitted to the pi socket
     */
    socket.on('getMission', (data) => {
        console.log(data);
        deviceMission = JSON.parse(data).device;
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                return console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        io.to('pi').emit('mission_download', JSON.parse(data).mission);
    });
    /********************************************************************/

    /**
     * This socket is listening to android socket which initiates the RTL
     * flight mode in the copter.
     * The command received from the android socket is emitted to the pi
     * socket for initiating the RTL
     */
    socket.on('RTL', (rtl) => {
        io.to('pi').emit('RTL',rtl);
    });

    /**
     * This socket is listening to android socket which initiates the LAND
     * flight mode in the copter.
     * The command received from the android socket is emitted to the pi
     * socket for initiating the LAND
     */
    socket.on('LAND', (land) => {
        io.to('pi').emit('LAND',land);
    });

    /**
     * This socket is listening to android socket which initiates the auto
     * flight mode in the copter.
     * The command received from the android socket is emitted to the pi
     * socket for initiating the flight
     */
    socket.on('fly', (msg) => {
        io.to('pi').emit('initiate_flight', msg);
    });
    /********************************************************************/

    /**
     * This socket is used for sending the position from android to the
     * pixhawk for loading the mission to the particular area.
     */
    socket.on('positions', (data) => {
        io.to('pi').emit('positions',JSON.parse(data).file+'.txt');
    });

    /**
     * TO simulate the previous mission
     */
    socket.on('simulate',() => {
        fs.readFile(datafile,(err,data) => {
            if (err) {
                console.log('error in simulate readfile ' +err);
            }
            let datas = data.toString();
            let splittedData = datas.split('\n');
            for (let i=0; i<splittedData.length-1; i++) {
                setTimeoutObject.push(setTimeout(sendData, 300*(i+1), socket,splittedData[i]));
            }
        });
    });

    /**
     * To cancel the simulation
     */
    socket.on('cancelSimulate', ()=> {
        for (let i= 0; i<setTimeoutObject.length-1; i++){
            clearTimeout(setTimeoutObject[i]);
        }
    });

    /**
     * Socket errors
     */
    socket.on('error', (error) => {
        console.log('Socket error : '+ JSON.stringify(error,undefined,2));
    });

    /**
     * to confirm the disconnected status with the client
     */
    socket.on('disconnect', () => {
        let indexWebsite = Website.indexOf(socket.id),
            indexAndroid = Android.indexOf(socket.id),
            indexPi = Pi.indexOf(socket.id);

        if (indexWebsite > -1) {
            Website.splice(indexWebsite, 1);
            console.log(`${socket.id} (Website) disconnected`);
        }
        if (indexAndroid > -1) {
            Android.splice(indexAndroid, 1);
            console.log(`${socket.id} (Android device) disconnected`);
        }
        if (indexPi > -1) {
            Pi.splice(indexPi, 1);
            io.to('website').emit('copter-data', {
                /**
                 * data format needed to send to the client when pi disconnect
                 */
                conn: 'False',
                fix: 0,
                numSat: 0,
                hdop: 10000,
                arm: 'False',
                head: 0,
                ekf: 'False',
                mode: 'UNKNOWN',
                status: 'UNKNOWN',
                volt: 0,
                gs: 0,
                as: 0,
                altr: 0,
                alt: 0,
                est: 0,
                lidar: 0,
                lat: lat,
                lng: lng
            });
            console.log(`${socket.id} (Pi) disconnected`);

            /*// backup({
            //   uri: process.env.MONGODB_URI,
            //   root: './',
            //   collection: ['dronedats'],
            //   parser: 'json'
            // });
            // the above method saves all fields and also saves each document to separate json file

            // find method doesn't return the fields mentioned
            // in second bracket called projections
            // the fields whose value are 0 are not included*/

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                DroneData.find({}, {
                    tokens: 0,
                    __id: 0,
                    _id: 0,
                    __v: 0
                }).cursor().on('data', function (doc) {
                    fileStream.write(JSON.stringify(doc)+ '\n');
                }).on('end', function () {
                    fileStream.end();
                    // check if collection exists and then dropped
                    db_native.listCollections({
                        name: 'dronedatas'
                    }).next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                DroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});

function sendData(socket,data) {
    console.log(data);
    socket.emit('simulateData',data);
}