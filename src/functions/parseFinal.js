import { loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";
import { roundDownLatLong } from "../utilities/location.js";

async function parseUniqueRouteList()
{
    const ctbRouteListJson = await loadJSONFromFile('./download/ctb/output/routeList_ctb.json');
    const gmbRouteListJson = await loadJSONFromFile('./download/gmb/output/routeList.json');
    const kmbRouteListJson = await loadJSONFromFile('./download/kmb/output/routeList_kmb.json');
    const mtrbusRouteListJson = await loadJSONFromFile('./download/mtrbus/output/routeList_mtrbus.json');
    const nlbRouteListJson = await loadJSONFromFile('./download/nlb/output/routeList_nlb.json');

    const uniqueRouteList = {};

    for (var j = 0; j < ctbRouteListJson.length; j++)
    {
        const route = ctbRouteListJson[j]['route'];
        uniqueRouteList[route] = route;
    }

    for (var j = 0; j < gmbRouteListJson.length; j++)
    {
        const route = gmbRouteListJson[j]['route'];
        uniqueRouteList[route] = route;
    }

    for (var i = 0; i < kmbRouteListJson.length; i++)
    {
        const route = kmbRouteListJson[i]['route'];
        uniqueRouteList[route] = route;
    }

    for (var k = 0; k < mtrbusRouteListJson.length; k++)
    {
        const route = mtrbusRouteListJson[k]['route'];
        uniqueRouteList[route] = route;
    }

    for (var m = 0; m < nlbRouteListJson.length; m++)
    {
        const route = nlbRouteListJson[m]['route'];
        uniqueRouteList[route] = route;
    }

    const saveFilePath = './download/finalOutput/uniqueRouteList.json';
    await saveJSONToFile(saveFilePath, uniqueRouteList);
}

async function parseUniqueRouteMap()
{
    const uniqueRouteList = await loadJSONFromFile('./download/finalOutput/uniqueRouteList.json');

    const uniqueRouteMap = {};

    for (const key in uniqueRouteList)
    {
        if (key.length >= 2)
        {
            const firstLetter = key.substring(0, 1);
            const secondLetter = key.substring(1, 2);

            if (firstLetter in uniqueRouteMap)
            {
                uniqueRouteMap[firstLetter][secondLetter] = secondLetter;
            }
            else
            {
                const newObj = {};
                newObj[secondLetter] = secondLetter;
                uniqueRouteMap[firstLetter] = newObj;
            }
        }

        if (key.length >= 3)
        {
            const firstTwoLetter = key.substring(0, 2);
            const thirdLetter = key.substring(2, 3);

            if (firstTwoLetter in uniqueRouteMap)
            {
                uniqueRouteMap[firstTwoLetter][thirdLetter] = thirdLetter;
            }
            else
            {
                const newObj = {};
                newObj[thirdLetter] = thirdLetter;
                uniqueRouteMap[firstTwoLetter] = newObj;
            }
        }

        if (key.length >= 4)
        {
            const firstThreeLetter = key.substring(0, 3);
            const fourthLetter = key.substring(3, 4);

            if (firstThreeLetter in uniqueRouteMap)
            {
                uniqueRouteMap[firstThreeLetter][fourthLetter] = fourthLetter;
            }
            else
            {
                const newObj = {};
                newObj[fourthLetter] = fourthLetter;
                uniqueRouteMap[firstThreeLetter] = newObj;
            }
        }
    }

    const saveFilePath = './download/finalOutput/uniqueRouteMap.json';
    await saveJSONToFile(saveFilePath, uniqueRouteMap);
}

async function parseUniqueRouteStopList()
{
    const ctbRouteStopListJson = await loadJSONFromFile('./download/ctb/output/routeStopList_ctb.json');
    const gmbRouteStopListJson = await loadJSONFromFile('./download/gmb/output/routeStopList_merge.json');
    const kmbRouteStopListJson = await loadJSONFromFile('./download/kmb/output/routeStopList_kmb.json');
    const kmbctbRouteStopListJson = await loadJSONFromFile('./download/kmbctb/output/routeStopList_kmbctb.json');
    const mtrbusRouteStopListJson = await loadJSONFromFile('./download/mtrbus/output/routeStopList_mtrbus.json');
    const nlbRouteStopListJson = await loadJSONFromFile('./download/nlb/output/routeStopList_nlb.json');


    const uniqueRouteStopList = {};

    for (const key in ctbRouteStopListJson)
    {
        uniqueRouteStopList[key] = ctbRouteStopListJson[key];
    }

    for (const key in gmbRouteStopListJson)
    {
        uniqueRouteStopList[key] = gmbRouteStopListJson[key];
    }

    for (const key in kmbRouteStopListJson)
    {
        uniqueRouteStopList[key] = kmbRouteStopListJson[key];
    }

    for (const key in kmbctbRouteStopListJson)
    {
        uniqueRouteStopList[key] = kmbctbRouteStopListJson[key];
    }

    for (const key in mtrbusRouteStopListJson)
    {
        uniqueRouteStopList[key] = mtrbusRouteStopListJson[key];
    }

    for (const key in nlbRouteStopListJson)
    {
        uniqueRouteStopList[key] = nlbRouteStopListJson[key];
    }

    const saveFilePath = './download/finalOutput/uniqueRouteStopList.json';
    await saveJSONToFile(saveFilePath, uniqueRouteStopList);
}

async function parseUniqueRouteStopListByLocation()
{
    var routeStopListByLocation = {};

    const routeStopListPath = './download/finalOutput/uniqueRouteStopList.json';
    const routeStopListJson = await loadJSONFromFile(routeStopListPath);

    for (const key in routeStopListJson)
    {
        for (var i=0 ; i<routeStopListJson[key].length ; i++)
        {
            const currItem = routeStopListJson[key][i];

            var lat = currItem['lat'];
            var lon = currItem['long'];

            var lat_roundDown = roundDownLatLong(lat);
            var lon_roundDown = roundDownLatLong(lon);

            var latLonKey = lat_roundDown + ',' + lon_roundDown;

            if (routeStopListByLocation[latLonKey])
            {
                routeStopListByLocation[latLonKey].push(currItem);
            }
            else
            {
                routeStopListByLocation[latLonKey] = [];
                routeStopListByLocation[latLonKey].push(currItem);
            }
        }
    }  
    
    const filePath = './download/finalOutput/uniqueRouteStopListByLocation.json';
    await saveJSONToFile(filePath, routeStopListByLocation);
}

async function generateVersion()
{
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const dateString = `${year}${month}${day}_${hours}${minutes}${seconds}`;

    const timestampArr = { version: dateString }

    const filePath = './download/finalOutput/version.json';
    await saveJSONToFile(filePath, timestampArr);
}

export { parseUniqueRouteList, parseUniqueRouteMap, parseUniqueRouteStopList, parseUniqueRouteStopListByLocation, generateVersion }

