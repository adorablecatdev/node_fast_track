async function findNearestCoopStop(lat, lon, routeStopList)
{
    return new Promise((resolve, reject) => {
        var distance = 10000;
        var closestStop = '';
    
        for (var i=0 ; i<routeStopList.length ; i++)
        {
            var currDistance = calculateDistance(parseFloat(lat), parseFloat(lon), parseFloat(routeStopList[i]['lat']), parseFloat(routeStopList[i]['long']));
            if (currDistance < distance)
            {
                distance = currDistance;
                closestStop = routeStopList[i]['stop'];
            }
        }
    
        resolve(closestStop);
    })
}

function roundDownLatLong(lat)
{
    try
    {
        var first = lat.toString().split('.')[0];
        var second = parseInt(lat.toString().split('.')[1].substring(0, 5));
    
        var result1 = parseInt(second / 300);
        var result2 = result1 * 300;
    
        var output = first + '.' + result2.toString();
        return output;
    }
    catch(e)
    {
        console.log(e);
        return 0;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) 
{
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c * 1000; // Distance in meters
    return distance;
}

function toRadians(degrees)
{
    return degrees * (Math.PI / 180);
}

export { findNearestCoopStop, roundDownLatLong, calculateDistance }