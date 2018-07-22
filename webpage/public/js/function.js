/**
 * calculate distance between two latitude and longitude
 * @param lat1 [latitude of position 1]
 * @param lng1 [longitude of position 1]
 * @param lat2 [latitude of position 2]
 * @param lng2 [longitude of position 2]
 * @return {number} [returns distance between then]
 */
function distanceLatLng (lat1,lng1,lat2,lng2) {
    let earthRadius = 6378137,
        dLat = toRad(lat2-lat1),
        dLng = toRad(lng2-lng1),
        latt1 = toRad(lat1),
        latt2 = toRad(lat2),
        a = Math.pow(Math.sin(dLat/2),2) + Math.pow(Math.sin(dLng/2),2)*Math.cos(latt1)*Math.cos(latt2),
        c = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

    return c*earthRadius;
}

/**
 * To convert millisecond to miniute and second form
 * @param millisec [millisecond input]
 * @return {string} [output minute:second format]
 */
function timeConversion(millisec) {

    let seconds = Math.floor((millisec / 1000)%60),
        minutes = Math.floor(millisec / (1000 * 60));

    return `${minutes}:${seconds}`;
}

/**
 * to convert from degree to radian
 * @param n [number in degree]
 * @return {number} [number in radian]
 */
function toRad(n) {
    return n * Math.PI / 180;
};

/**
 * to convert from radian to degree
 * @param n [number in radian]
 * @return {number} [number in degree]
 */
function toDeg(n) {
    return n * 180 / Math.PI;
};

/**
 * function to find another latitude and another longitude
 * @param lat1 [center latitude with respect to which another latitude is determined]
 * @param lon1 [center longitude with respect to which another longitude is determined]
 * @param brng [angle from the center with clockwise from North (North being 0)]
 * @param dist [distance from the center up to which the another latitude and longitude is required]
 * @return {{lat: number, lng: *}} [final latitude and longitude]
 */
function destVincenty(lat1, lon1, brng, dist) {
    var a = 6378137,
        b = 6356752.3142,
        f = 1 / 298.257223563, // WGS-84 ellipsiod
        s = dist,
        alpha1 = toRad(brng),
        sinAlpha1 = Math.sin(alpha1),
        cosAlpha1 = Math.cos(alpha1),
        tanU1 = (1 - f) * Math.tan(toRad(lat1)),
        cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1,
        sigma1 = Math.atan2(tanU1, cosAlpha1),
        sinAlpha = cosU1 * sinAlpha1,
        cosSqAlpha = 1 - sinAlpha * sinAlpha,
        uSq = cosSqAlpha * (a * a - b * b) / (b * b),
        A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
        B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
        sigma = s / (b * A),
        sigmaP = 2 * Math.PI;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
            sinSigma = Math.sin(sigma),
            cosSigma = Math.cos(sigma),
            deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    }
    var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
        lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
        lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
        C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
        L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
        revAz = Math.atan2(sinAlpha, -tmp); // final bearing

    return {lat:toDeg(lat2), lng:lon1 + toDeg(L)};
}