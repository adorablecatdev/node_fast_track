import { downloadCsvAndConvertJson, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";

async function downloadRouteStopListMtrBus()
{
    const url = 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fopendata.mtr.com.hk%2Fdata%2Fmtr_bus_stops.csv';
    const downloadFilePath = './download/mtrbus/raw/routeStop/routeStopList.json';
    await downloadCsvAndConvertJson(url, downloadFilePath);
}

async function parseJsonMtrBus()
{
    const readFilePath = './download/mtrbus/raw/routeStop/routeStopList.json';
    const routeStopListJson = await loadJSONFromFile(readFilePath);
    
    // Prepare data for parsing route list and route stop list
    var routeStopListMap = {};
    for(var i=0 ; i<routeStopListJson.length ; i++)
    {
        const currItem = routeStopListJson[i];
        const route_id_temp = currItem['ROUTE_ID'] + '_' + currItem['DIRECTION']; 

        if (route_id_temp in routeStopListMap)
            routeStopListMap[route_id_temp].push(currItem);
        else
        {
            var newArr = [currItem];
            routeStopListMap[route_id_temp] = newArr;
        }
    }

    // Parse route list
    var newRouteList = []
    for (const key in routeStopListMap)
    {
        var currArray = routeStopListMap[key];
        var firstStop = currArray[0];
        var lastStop = currArray[currArray.length-1];

        const id = 'mtrbus_' + firstStop['ROUTE_ID'] + '_' + firstStop['DIRECTION'];
        var item = {};
        item['company'] = 'mtrbus';
        item['id'] = id;
        item['route'] = firstStop['ROUTE_ID'];
        item['dir'] = firstStop['DIRECTION'];
        item['from_tc'] = firstStop[`STATION_NAME_CHI`];
        item['from_en'] = firstStop[`STATION_NAME_ENG`];
        item['to_tc'] = lastStop[`STATION_NAME_CHI`];
        item['to_en'] = lastStop[`STATION_NAME_ENG`];

        newRouteList.push(item);
    }

    const filePath = `./download/mtrbus/output/routeList_mtrbus.json`;
    await saveJSONToFile(filePath, newRouteList);

    // Parse route stop list
    var newRouteStopList = {}
    for (const key in routeStopListMap)
    {
        var currArray = routeStopListMap[key];
        var firstStop = currArray[0];
        var lastStop = currArray[currArray.length-1];
        const id = 'mtrbus_' + firstStop['ROUTE_ID'] + '_' + firstStop['DIRECTION'];

        var newRouteArray = [];
        for (var j=0 ; j<currArray.length ; j++)
        {
            var newStop = {};
            newStop['company'] = 'mtrbus';
            newStop['id'] = id;
            newStop['stop_id'] = `mtrbus_${firstStop['ROUTE_ID']}_${firstStop['DIRECTION']}_${currArray[j]['STATION_ID']}`
            newStop['route'] = firstStop['ROUTE_ID'];
            newStop['dir'] = firstStop['DIRECTION'];
            newStop['from_tc'] = firstStop[`STATION_NAME_CHI`];
            newStop['from_en'] = firstStop[`STATION_NAME_ENG`];
            newStop['to_tc'] = lastStop[`STATION_NAME_CHI`];
            newStop['to_en'] = lastStop[`STATION_NAME_ENG`];
            newStop['name_tc'] = currArray[j][`STATION_NAME_CHI`];
            newStop['name_en'] = currArray[j][`STATION_NAME_ENG`];
            newStop['seq'] = currArray[j]['STATION_SEQNO'];
            newStop['stop'] = currArray[j]['STATION_ID'];
            newStop['lat'] = currArray[j]['STATION_LATITUDE'];
            newStop['long'] = currArray[j]['STATION_LONGITUDE'];

            newRouteArray.push(newStop);
        }

        newRouteStopList[id] = newRouteArray;
    }

    const filePath2 = `./download/mtrbus/output/routeStopList_mtrbus.json`;
    await saveJSONToFile(filePath2, newRouteStopList);
}

export {downloadRouteStopListMtrBus, parseJsonMtrBus}