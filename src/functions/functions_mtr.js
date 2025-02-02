import { mtrRouteNameEn, mtrRouteNameTc, stationLocation } from "./mtrMetaData.js";
import { downloadCsvAndConvertJson, downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';

async function downloadMtrRoutStopList()
{
    const url = 'https://opendata.mtr.com.hk/data/mtr_lines_and_stations.csv';
    const downloadFilePath = './download/mtr/raw/routeStopList.json';
    await downloadCsvAndConvertJson(url, downloadFilePath);
}

async function createMtrRouteList()
{
    const readFilePath = './download/mtr/raw/routeStopList.json';
    const RAW_stop_list = await loadJSONFromFile(readFilePath);

    const addedStationMap = {};
    const routeStopListUnsorted = {};

    for (var i = 0; i < RAW_stop_list.length; i++)
    {
        const currItem = RAW_stop_list[i];
        if (currItem?.['Line Code'] != '')
        {
            const directionArr = currItem?.['Direction'].split('-');
            var id_temp = '';
            var stop_id_temp = '';

            if (directionArr.length == 2)
            {
                id_temp = 'mtr_' + currItem?.['Line Code'];
                stop_id_temp = currItem?.['Line Code'] + '_' + currItem?.['Station Code'];
            }
            else
            {
                id_temp = 'mtr_' + currItem?.['Line Code'];
                stop_id_temp = currItem?.['Line Code'] + '_' + currItem?.['Station Code'];
            }

            var insertItem = {}
            try
            {
                insertItem = {
                    "company": "mtr",
                    "stop_id": `mtr_${currItem?.['Line Code']}_${currItem?.['Station Code']}_${currItem?.['Sequence'].toString().split('.')?.[0]}`,
                    "id": id_temp,
                    "route": currItem?.['Line Code'],
                    "route_name_tc": mtrRouteNameTc?.[currItem?.['Line Code']],
                    "route_name_en": mtrRouteNameEn?.[currItem?.['Line Code']],
                    "name_en": currItem?.['English Name'],
                    "name_tc": currItem?.['Chinese Name'],
                    "seq": currItem?.['Sequence'].toString().split('.')?.[0],
                    "stop": currItem?.['Station Code'],
                    "lat": stationLocation?.[currItem?.['Station Code']]?.['lat'],
                    "long": stationLocation?.[currItem?.['Station Code']]?.['long']
                }
            }
            catch (error)
            {
                console.log(error);
                console.log(currItem);
            }

            if (stop_id_temp in addedStationMap == false)
            {
                if (id_temp in routeStopListUnsorted)
                    routeStopListUnsorted[id_temp].push(insertItem);
                else
                {
                    var newArr = [insertItem];
                    routeStopListUnsorted[id_temp] = newArr;
                }

                addedStationMap[stop_id_temp] = stop_id_temp;
            }
        }
    }

    const routeStopListSorted = {};
    for (const key in routeStopListUnsorted)
    {
        const currArray = routeStopListUnsorted?.[key];
        const sorted = [...currArray].sort((a, b) =>
        {
            return parseInt(a.seq) - parseInt(b.seq);
        });
        routeStopListSorted[key] = sorted;
    }

    const filePath2 = './download/mtr/output/routeStopList_mtr.json';
    await saveJSONToFile(filePath2, routeStopListSorted);

    // PARSE ROUTE LIST
    var newRouteList = [];
    for (const key in routeStopListSorted)
    {
        var currArray = routeStopListSorted[key];
        var firstStop1 = currArray[0];
        var firstStop2 = currArray[0]?.['seq'] == currArray[1]?.['seq'] ? currArray[1] : null;
        var lastStop1 = currArray[currArray.length - 1];
        var lastStop2 = currArray[currArray.length - 1]?.['seq'] == currArray[currArray.length - 2]?.['seq'] ? currArray[currArray.length - 2] : null;


        var insertItem = {};
        insertItem['company'] = 'mtr';
        insertItem['id'] = firstStop1?.['id'];
        insertItem['route'] = firstStop1?.['route'];
        insertItem['direction'] = firstStop1?.['direction'];
        insertItem['from_en'] = firstStop1?.['name_en'] + (firstStop2 ? `/${firstStop2?.['name_en']}` : '');
        insertItem['from_tc'] = firstStop1?.['name_tc'] + (firstStop2 ? `/${firstStop2?.['name_tc']}` : '');
        insertItem['to_en'] = lastStop1?.['name_en'] + (lastStop2 ? `/${lastStop2?.['name_en']}` : '');
        insertItem['to_tc'] = lastStop1?.['name_tc'] + (lastStop2 ? `/${lastStop2?.['name_tc']}` : '');

        newRouteList.push(insertItem);
    }

    const filePath = './download/mtr/output/routeList_mtr.json';
    await saveJSONToFile(filePath, newRouteList);
}

async function getMtrStationFirstAndLastTrain(stopNo, lang)
{
    const url = `https://www.mtr.com.hk/en/customer/services/service_hours_search.php?query_type=search&station=${stopNo}`;
    const browser = await puppeteer.launch();

    try
    {
        const page = await browser.newPage();

        // Go to page and wait for it to load
        await page.goto(url, { waitUntil: 'networkidle0' });

        if (lang == 'tc')
        {
            // Wait for the language button to be present
            await page.waitForSelector('a.btn_chang[title="中文"]');
            await page.click('a.btn_chang[title="中文"]');
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }

        // Now wait for the station name element
        // await page.waitForSelector('#stnName');

        // Get the page content
        const content = await page.content();
        console.log(content);

        // Parse with cheerio
        const $ = cheerio.load(content);

        // const trainData = {};
        const trainDataArray = [];
        let currentLineName = '';
        const stationName = $('#stnName').text().replace(lang == 'tc' ? ' — ' : ' - ', '');

        $('.resultWrap').children().each((index, element) =>
        {
            if ($(element).is('h2'))
            {
                currentLineName = $(element).text().trim();
            }
            else if ($(element).find('table.table-d').length > 0)
            {
                $(element).find('tr').each((index, row) =>
                {
                    const station = $(row).find('.tr-color span').text().trim();
                    const firstTrain = $(row).find('.firstTrain').text().trim();
                    const lastTrain = $(row).find('td:last-child').text().trim();

                    if (station && firstTrain && lastTrain)
                    {
                        trainDataArray.push({
                            line: currentLineName.replace('綫', '線'),
                            to: station,
                            firstTrain: firstTrain,
                            lastTrain: lastTrain,
                            station: stationName
                        });
                    }
                });
            }
        });

        return trainDataArray;
    }
    catch (error)
    {
        console.error(`Error fetching page ${stopNo} ${lang}:`, error);
        return [];
    }
    finally
    {
        await browser.close();
    }
}

async function getAllMtrFirstAndLastTrain()
{
    const result = [];

    try
    {
        for (let i = 1; i <= 120; i++)
        {
            // console.log(`Processing station ${i} tc...`);
            // const schedule_tc = await getMtrStationFirstAndLastTrain(i.toString(), 'tc');

            // if (schedule_tc && schedule_tc.length > 0)
            // {
            //     result.push(...schedule_tc);
            // }

            console.log(`Processing station ${i} en...`);
            const schedule_en = await getMtrStationFirstAndLastTrain(i.toString(), 'en');

            if (schedule_en && schedule_en.length > 0)
            {
                result.push(...schedule_en);
            }
        }

        const resultObj = {};

        for(var j=0 ; j<result.length ; j++)
        {
            if (result[j]?.['station'] in resultObj == false)
            {
                resultObj[result[j]?.['station']] = [];
            }

            resultObj[result[j]?.['station']].push(result[j]);
        }

        const filePath = `./download/mtr/output/mtrTimetable.json`;
        await saveJSONToFile(filePath, resultObj);


    } catch (error)
    {
        console.error('Error in scraping:', error);
    }
}

export { downloadMtrRoutStopList, createMtrRouteList, getAllMtrFirstAndLastTrain }