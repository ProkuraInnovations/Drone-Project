/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let {mongoose} = require('../db/mongoose');
let {PulchowkDroneData} = require('../models/droneData');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat1,
    lng1,
    Pi1 = [],
    Website1 = [],
    Android1 = [],
    deviceMission1;

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/missionPulchowk.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmissionPulchowk.txt'),
    datafile = path.join(__dirname, '../..', '/public/dataPulchowk.txt');
/********************************************************************/

/**
 * Pulchowk namespace
 */
const pulchowk = io.of('/pulchowk');

pulchowk.on('connection', (socket) => {

    socket.on('joinPi', () => {
        Pi1.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi Pulchowk) connected`);
    });

    socket.on('joinAndroid', () => {
        Android1.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android Pulchowk) connected`);
    });

    socket.on('joinWebsite', () => {
        Website1.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website Pulchowk) connected`);
    });

    socket.on('success', (msg) => {
        pulchowk.to('android').emit('success', msg);
    });

    socket.on('data', (data) => {
        pulchowk.to('android').to('website').emit('copter-data', {
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
        });
        lat1 = data.lat;
        lng1 = data.lng;
        let pulchowkDroneData = new PulchowkDroneData(data);
        pulchowkDroneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved. : ' + e);
        });
    });

    socket.on('homePosition', (homeLocation) => {
        pulchowk.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        pulchowk.to('website').emit('error', error.msg);
        if (error.context === 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                pulchowk.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context === 'Prearm') {
            pulchowk.to('android').emit('success', error.msg);
        } else if (error.context === 'Connection') {
            pulchowk.to('android').emit('success', error.msg);
        }
    });

    socket.on('waypoints', (waypoints) => {
        if (deviceMission1 == "android") {
            pulchowk.to('android').emit('Mission',waypoints);
        } else if (deviceMission1 == "website") {
            pulchowk.to('website').emit('Mission',waypoints);
        }        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });

    socket.on('getMission', (data) => {
        deviceMission1 = JSON.parse(data).device;
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        pulchowk.to('pi').emit('mission_download', JSON.parse(data).mission);
    });

    socket.on('RTL', (rtl) => {
        pulchowk.to('pi').emit('RTL',rtl);
    });

    socket.on('LAND', (land) => {
        pulchowk.to('pi').emit('LAND',land);
    });

    socket.on('fly', (msg) => {
        pulchowk.to('pi').emit('initiate_flight', msg);
    });

    socket.on('disconnect', () => {
        let indexWebsite1 = Website1.indexOf(socket.id),
            indexAndroid1 = Android1.indexOf(socket.id),
            indexPi1 = Pi1.indexOf(socket.id);

        if (indexWebsite1 > -1) {
            Website1.splice(indexWebsite1, 1);
            console.log(`${socket.id} (Website Pulchowk) disconnected`);
        }
        if (indexAndroid1 > -1) {
            Android1.splice(indexAndroid1, 1);
            console.log(`${socket.id} (Android device Pulchowk) disconnected`);
        }
        if (indexPi1 > -1) {
            Pi1.splice(indexPi1, 1);
            pulchowk.to('website').emit('copter-data', {
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
                lat: lat1,
                lng: lng1
            });
            console.log(`${socket.id} (Pi Pulchowk) disconnected`);

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                PulchowkDroneData.find({}, {
                    tokens: 0,
                    __id: 0,
                    _id: 0,
                    __v: 0
                }).cursor().on('data', function (doc) {
                    fileStream.write(doc.toString() + '\n');
                }).on('end', function () {
                    fileStream.end();
                    // check if collection exists and then dropped
                    db_native.listCollections({
                        name: 'pulchowkdronedatas'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                PulchowkDroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});