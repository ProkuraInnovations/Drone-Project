let map,
    marker = "undefined",
    StartOfFlight,
    prev_lat,
    prev_lng,
    armedCheck = 'True',
    Home= {lat:parseFloat('27.686331'), lng:parseFloat('85.317652')},
    markers=[],
    flightPathCoordinate= [],
    dC=[],
    line1= [],
    line2= [],
    flightArray =[],
    flag1= 'False';

let marker1 = "undefined",
    socket1,
    Home1 = {lat:parseFloat('26.951955770968716'), lng:parseFloat('85.75095183886958')},
    armedCheck1 = 'True',
    prev_lat1,
    prev_lng1,
    flag11 = 'False';

let marker2 = "undefined",
    socket2,
    Home2 = {lat:parseFloat('21.91299414742735'), lng:parseFloat('77.70895965136958')},
    armedCheck2 = 'True',
    prev_lat2,
    prev_lng2,
    flag12 = 'False';

let marker3 = "undefined",
    socket3,
    Home3 = {lat:parseFloat('34.73850120571217'), lng:parseFloat('99.98923308886958')},
    armedCheck3 = 'True',
    prev_lat3,
    prev_lng3,
    flag13 = 'False';

socket1 = io();
socket2 = io("/nangi");
socket3 = io("/pulchowk");

/**
 * to check connection status with the server
 */
socket1.on('connect', function () {
    joinSocket(socket1);
});
socket2.on('connect', function () {
    joinSocket(socket2);
});
socket3.on('connect', function () {
    joinSocket(socket3);
});

/**
 * to listens to the server socket and renders the data and map as required
 */
socket1.on('copter-data', function (data) {

    let copterdata1 = copterData(data,2,armedCheck1,prev_lat1,prev_lng1,flag11,marker1);
    prev_lat1 = copterdata1.prev_lat;
    prev_lng1 = copterdata1.prev_lng;
    armedCheck1 = copterdata1.armedCheck;
    flag11 = copterdata1.flag1;
    map = copterdata1.map;
    marker1 = copterdata1.marker;
});

socket2.on('copter-data', function (data) {

    let copterdata2 = copterData(data,2,armedCheck2,prev_lat2,prev_lng2,flag12,marker2);
    prev_lat2 = copterdata2.prev_lat;
    prev_lng2 = copterdata2.prev_lng;
    armedCheck2 = copterdata2.armedCheck;
    flag12 = copterdata2.flag1;
    map = copterdata2.map;
    marker2 = copterdata2.marker;
});

socket3.on('copter-data', function (data) {

    let copterdata3 = copterData(data,2,armedCheck3,prev_lat3,prev_lng3,flag13,marker3);
    prev_lat3 = copterdata3.prev_lat;
    prev_lng3 = copterdata3.prev_lng;
    armedCheck3 = copterdata3.armedCheck;
    flag13 = copterdata3.flag1;
    map = copterdata3.map;
    marker3 = copterdata3.marker;
});

/**
 * Socket to obtain the home loaction
 */
socket1.on('homePosition', function (homeLocation) {
    Home1 = homePositionData(homeLocation);
});

socket2.on('homePosition', function (homeLocation) {
    Home2 = homePositionData(homeLocation);
});

socket3.on('homePosition', function (homeLocation) {
    Home3 = homePositionData(homeLocation);
});

/**
 * Socket to display the error message for 3 second in the
 * base to the website
 */
socket1.on('error', function (msg)  {
    snackBar(msg);
});

socket2.on('error', function (msg)  {
    snackBar(msg);
});

socket3.on('error', function (msg)  {
    snackBar(msg);
});

/**
 * to read mission from the companion computer
 */
socket1.on('Mission',function (waypoints) {
    Home1 = missionWaypoints(waypoints);
});

socket2.on('Mission',function (waypoints) {
    Home2 = missionWaypoints(waypoints);
});

socket3.on('Mission',function (waypoints) {
    Home3 = missionWaypoints(waypoints);
});

/**
 * initmap update the map with the initial map google map.
 */
function initmap() {

   let data1 = initialMap(Home1,map,marker1,1);
   map = data1.map;
   marker1 = data1.marker;

   let data2 = initialMap(Home2,map,marker2,2);
   marker2 = data2.marker;

   let data3 = initialMap(Home3,map,marker3,2);
   marker3 = data2.marker;
}

/**
 * read mission from the pi
 */
function ReadMission() {
    readMission(socket1);
    readMission(socket2);
    readMission(socket3);
}

/**
 * to check disconnect status
 */
socket1.on('disconnect', function () {
    console.log('disconneted from the server');
});

socket2.on('disconnect', function () {
    console.log('disconneted from the server');
});

socket3.on('disconnect', function () {
    console.log('disconneted from the server');
});

