import fs from 'fs';
import { downloadAndUnzip, saveJSONToFile } from '../utilities/file_management.js';

async function downloadTimetable()
{
    const url_tc = `https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fstatic.data.gov.hk%2Ftd%2Fpt-headway-tc%2Fgtfs.zip`;
    const downloadPath = `./download/timetable`;
    const unzipPath_tc = `./download/timetable/gtfs_tc`;
    await downloadAndUnzip(url_tc, downloadPath, unzipPath_tc);

    const url_en = `https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fstatic.data.gov.hk%2Ftd%2Fpt-headway-en%2Fgtfs.zip`;
    const unzipPath_en = `./download/timetable/gtfs_en`;
    await downloadAndUnzip(url_en, downloadPath, unzipPath_en);

}

async function processTimetable()
{
    const data1 = fs.readFileSync('./download/timetable/gtfs_tc/frequencies.txt', 'utf8');
    const lines1 = data1.split(/\r?\n/);

    // Generate frequency map: e.g. [frequencyID]:{ startTime: '07:10-08:00, 'frequency':'25' }
    var frequencyMap = {};
    lines1.forEach((line, index) =>
    {
        if (index != 0)
        {
            const currLine = line.split(',');
            const frequencyID = currLine[0] != undefined ? currLine[0] : "";
            const timeFrom = currLine[1] != undefined ? currLine[1].substring(0, 5) : "";
            const timeTo = currLine[2] != undefined ? currLine[2].substring(0, 5) : "";
            const frequency = currLine[3] != undefined ? Math.round(parseInt(currLine[3]) / 60) : 0;

            frequencyMap[frequencyID] = { 'timeRange': timeFrom + ' - ' + timeTo, 'frequency': frequency };
        }
    });
    const filePath1 = './download/timetable/TEMP_frequencyMap.json';
    await saveJSONToFile(filePath1, frequencyMap);


    // Generate route map TC: [routeID]: { 'meta':'kmb12A', 'from':'ABC', 'to':'DEF' }]
    const data2 = fs.readFileSync('./download/timetable/gtfs_tc/routes.txt', 'utf8');
    const lines2 = data2.split(/\r?\n/);

    var routesMap_tc = {};
    lines2.forEach((line, index) =>
    {
        if (index != 0)
        {
            const currLine = line.split(',');
            const routeID = currLine[0] != undefined ? currLine[0] : "";
            var company = currLine[1] != undefined ? currLine[1] : "";

            if (company == 'CTB') { company = 'ctb'; }
            else if (company == 'GMB') { company = 'gmb'; }
            else if (company == 'KMB') { company = 'kmb'; }
            else if (company == 'KMB+CTB') { company = 'kmbctb'; }
            else if (company == 'LRTFeeder') { company = 'mtrbus'; }
            else if (company == 'LWB') { company = 'kmb'; }
            else if (company == 'FERRY') { company = 'ferry'; }
            else if (company == 'NLB') { company = 'nlb'; }

            const routeNumber = currLine[2] != undefined ? currLine[2] : "";
            const from = currLine[3] != undefined ? currLine[3].split(' - ')[0] : "";
            const to = currLine[3] != undefined ? currLine[3].split(' - ')[1] : "";
            routesMap_tc[routeID] = { 'meta': company + '_' + routeNumber, 'from': from, 'to': to };
        }
    });
    const filePath2 = './download/timetable/TEMP_routeMap_tc.json';
    await saveJSONToFile(filePath2, routesMap_tc);


    // Generate route map EN: [routeID]: { 'meta':'kmb12A', 'from':'ABC', 'to':'DEF' }]
    const data3 = fs.readFileSync('./download/timetable/gtfs_en/routes.txt', 'utf8');
    const lines3 = data3.split(/\r?\n/);

    var routesMap_en = {};
    lines3.forEach((line, index) =>
    {
        if (index != 0)
        {
            const currLine = line.split(',');
            const routeID = currLine[0] != undefined ? currLine[0] : "";
            var company = currLine[1] != undefined ? currLine[1] : "";

            if (company == 'CTB') { company = 'ctb'; }
            else if (company == 'GMB') { company = 'gmb'; }
            else if (company == 'KMB') { company = 'kmb'; }
            else if (company == 'KMB+CTB') { company = 'kmbctb'; }
            else if (company == 'LRTFeeder') { company = 'mtrbus'; }
            else if (company == 'LWB') { company = 'kmb'; }
            else if (company == 'FERRY') { company = 'ferry'; }
            else if (company == 'NLB') { company = 'nlb'; }

            const routeNumber = currLine[2] != undefined ? currLine[2] : "";
            const from = currLine[3] != undefined ? currLine[3].split(' - ')[0] : "";
            const to = currLine[3] != undefined ? currLine[3].split(' - ')[1] : "";
            routesMap_en[routeID] = { 'meta': company + '_' + routeNumber, 'from': from, 'to': to };
        }
    });
    const filePath3 = './download/timetable/TEMP_routeMap_en.json';
    await saveJSONToFile(filePath3, routesMap_en);


    // Mapping frequency to route 
    const data4 = fs.readFileSync('./download/timetable/gtfs_tc/trips.txt', 'utf8');
    const lines4 = data4.split(/\r?\n/);

    var timeTableMap = {};
    lines4.forEach((line, index) =>
    {
        if (index != 0)
        {
            const currLine = line.split(',');

            const routeID = currLine[0] != undefined ? currLine[0] : "";
            const weekday = currLine[1] != undefined ? currLine[1] : "";
            const tripID = currLine[2] != undefined ? currLine[2] : "";

            var time = "";
            var dir = "";
            var key = "";
            try { time = tripID.split('-')[3].slice(0, 2) + ':' + tripID.split('-')[3].slice(2); } catch (e) { }
            try { dir = tripID.split('-')[1]; } catch (e) { }
            try { key = routesMap_tc[routeID]['meta'] + '_' + dir; } catch (e) { }

            if (key in timeTableMap == false)
            {
                if (dir == '1')
                    timeTableMap[key] = { 'from_tc': routesMap_tc[routeID]['from'], 'from_en': routesMap_en[routeID]['from'], 'schedule': {} };
                else
                    timeTableMap[key] = { 'from_tc': routesMap_tc[routeID]['to'], 'from_en': routesMap_en[routeID]['to'], 'schedule': {} };
            }

            if (weekday in timeTableMap[key]['schedule'] == false)
            {
                var newArray = [];
                timeTableMap[key]['schedule'][weekday] = newArray;
            }

            if (tripID in frequencyMap)
            {
                timeTableMap[key]['schedule'][weekday].push(
                    {
                        'weekday': weekday,
                        'type': 'timeRange',
                        'timeRange': frequencyMap[tripID]['timeRange'],
                        'frequency': frequencyMap[tripID]['frequency']
                    }
                );
            }
            else
                timeTableMap[key]['schedule'][weekday].push({ 'weekday': weekday, 'type': 'departure', 'time': time });
        }
    });

    const filePath4 = './download/finalOutput/timetable.json';
    await saveJSONToFile(filePath4, timeTableMap);

    // return routesMap;

    // return timeTableMap;

    // return frequencyMap;
}

export { downloadTimetable, processTimetable }