/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let {mongoose} = require('../db/mongoose');
let {NangiDroneData} = require('../models/droneData');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat2,
    lng2,
    Pi2 = [],
    Website2 = [],
    Android2 = [],
    deviceMission2;

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/missionNangi.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmissionNangi.txt'),
    datafile = path.join(__dirname, '../..', '/public/dataNangi.txt');
/********************************************************************/

/**
 * Nangi namespace
 */
const nangi = io.of('/nangi');

nangi.on('connection', (socket) => {

    socket.on('joinPi', () => {
        Pi2.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi Nangi) connected`);
    });

    socket.on('joinAndroid', () => {
        Android2.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android Nangi) connected`);
    });

    socket.on('joinWebsite', () => {
        Website2.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website Nangi) connected`);
    });

    socket.on('success', (msg) => {
        nangi.to('android').emit('success',msg);
    });

    socket.on('data', (data) => {
        nangi.to('android').to('website').emit('copter-data', {
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
        lat2 = data.lat;
        lng2 = data.lng;
        let nangiDroneData = new NangiDroneData(data);
        nangiDroneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved. : ' + e);
        });
    });

    socket.on('homePosition', (homeLocation) => {
        nangi.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        nangi.to('website').emit('error', error.msg);
        if (error.context === 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                nangi.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context === 'Prearm') {
            nangi.to('android').emit('success', error.msg);
        } else if (error.context === 'Connection') {
            nangi.to('android').emit('success', error.msg);
        }
    });

    socket.on('waypoints', (waypoints) => {
        if (deviceMission2 == "android") {
            nangi.to('android').emit('Mission',waypoints);
        } else if (deviceMission2 == "website") {
            nangi.to('website').emit('Mission',waypoints);
        }
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });

    socket.on('getMission', (data) => {
        deviceMission2 = JSON.parse(data).device;
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        nangi.to('pi').emit('mission_download', JSON.parse(data).mission);
    });

    socket.on('RTL', (rtl) => {
        nangi.to('pi').emit('RTL',rtl);
    });

    socket.on('LAND', (land) => {
        nangi.to('pi').emit('LAND',land);
    });

    socket.on('fly', (msg) => {
        nangi.to('pi').emit('initiate_flight', msg);
    });

    socket.on('disconnect', () => {
        let indexWebsite2 = Website2.indexOf(socket.id),
            indexAndroid2 = Android2.indexOf(socket.id),
            indexPi2 = Pi2.indexOf(socket.id);

        if (indexWebsite2 > -1) {
            Website2.splice(indexWebsite2, 1);
            console.log(`${socket.id} (Website Nangi) disconnected`);
        }
        if (indexAndroid2 > -1) {
            Android2.splice(indexAndroid2, 1);
            console.log(`${socket.id} (Android device Nangi) disconnected`);
        }
        if (indexPi2 > -1) {
            Pi2.splice(indexPi2, 1);
            nangi.to('website').emit('copter-data', {
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
                lat: lat2,
                lng: lng2
            });
            console.log(`${socket.id} (Pi Nangi) disconnected`);

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                NangiDroneData.find({}, {
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
                        name: 'nangidronedatas'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                NangiDroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});