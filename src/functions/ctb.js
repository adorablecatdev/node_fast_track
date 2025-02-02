import { coopRoutes } from "../utilities/constants.js";
import { downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";

async function downloadRouteListCtb()
{
    const url = 'https://rt.data.gov.hk/v2/transport/citybus/route/ctb';
    const downloadFilePath = './download/ctb/raw/route/routeList.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function downloadRouteStopCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    var jobCount = routeListJson['data'].length;
    var downloadedCount = 0;

    for (var i = 0; i < routeListJson['data'].length; i++)
    {
        const url1 = 'https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/' + routeListJson['data'][i]['route'] + '/inbound';
        const downloadFilePath1 = './download/ctb/raw/routeStop/' + routeListJson['data'][i]['route'] + '_inbound.json';
        await downloadJSONFile(url1, downloadFilePath1);

        const url2 = 'https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/' + routeListJson['data'][i]['route'] + '/outbound';
        const downloadFilePath2 = './download/ctb/raw/routeStop/' + routeListJson['data'][i]['route'] + '_outbound.json';
        await downloadJSONFile(url2, downloadFilePath2);

        downloadedCount++;
        console.log('Downloaded ' + downloadedCount + '/' + jobCount);

        if (i % 5 == 0)
        {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
}

async function downloadStopCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    var stopIDArray = [];
    var stopIDObject = {};

    for (var i = 0; i < routeListJson?.['data'].length; i++)
    {
        const readFilePath_inbound = `./download/ctb/raw/routeStop/${routeListJson?.['data'][i]?.['route']}_inbound.json`;
        const routeStopJson_inbound = await loadJSONFromFile(readFilePath_inbound);

        if (routeStopJson_inbound?.['data'].length > 0)
        {
            for (var j = 0; j < routeStopJson_inbound?.['data'].length; j++)
            {
                if (routeStopJson_inbound?.['data'][j]?.['stop'] in stopIDObject == false)
                {
                    stopIDArray.push(routeStopJson_inbound?.['data'][j]?.['stop']);
                    stopIDObject[routeStopJson_inbound?.['data'][j]?.['stop']] = routeStopJson_inbound?.['data'][j]?.['stop'];
                }
            }
        }

        const readFilePath_outbound = `./download/ctb/raw/routeStop/${routeListJson?.['data'][i]?.['route']}_outbound.json`;
        const routeStopJson_outbound = await loadJSONFromFile(readFilePath_outbound);

        if (routeStopJson_outbound?.['data'].length > 0)
        {
            for (var k = 0; k < routeStopJson_outbound?.['data'].length; k++)
            {
                if (routeStopJson_outbound?.['data'][k]?.['stop'] in stopIDObject == false)
                {
                    stopIDArray.push(routeStopJson_outbound?.['data'][k]?.['stop']);
                    stopIDObject[routeStopJson_outbound?.['data'][k]?.['stop']] = routeStopJson_outbound?.['data'][k]?.['stop'];
                }
            }
        }
    }

    var jobCount = stopIDArray.length
    var downloadedCount = 0;
    for (var m = 0; m < stopIDArray.length; m++)
    {
        const url1 = 'https://rt.data.gov.hk/v2/transport/citybus/stop/' + stopIDArray[m];
        const downloadFilePath1 = './download/ctb/raw/stop/' + stopIDArray[m] + '.json';
        await downloadJSONFile(url1, downloadFilePath1);

        downloadedCount++;
        console.log('Downloaded ' + downloadedCount + '/' + jobCount);

        if (i % 5 == 0)
        {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
}

async function parseJsonCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    const routeList = [];
    const routeStopList = {};

    for (var i = 0; i < routeListJson?.['data'].length; i++)
    {
        // if (i == 10) { break ;}
        const currRoute = routeListJson?.['data'][i];
        var company = '';

        if (currRoute?.['route'] in coopRoutes)
            company = 'kmbctb';
        else
            company = 'ctb';

        const readFilePath_inbound = `./download/ctb/raw/routeStop/${currRoute?.['route']}_inbound.json`;
        const routeStopJson_inbound = await loadJSONFromFile(readFilePath_inbound);

        if (routeStopJson_inbound?.['data'] && routeStopJson_inbound?.['data'].length > 0)
        {
            const id = `${company}_${currRoute?.['route']}_I`;

            const newRoute = {
                'id': id,
                'company': company,
                'route': currRoute?.['route'],
                'from_tc': currRoute?.[`dest_tc`],
                'from_en': currRoute?.[`dest_en`],
                'to_tc': currRoute?.[`orig_tc`],
                'to_en': currRoute?.[`orig_en`],
                'dir': 'I'
            }

            routeList.push(newRoute);

            const currRouteStopList = [];
            for (var j = 0; j < routeStopJson_inbound?.['data'].length; j++)
            {
                const currStop = routeStopJson_inbound?.['data'][j];

                const readFilePath_stop = `./download/ctb/raw/stop/${currStop?.['stop']}.json`;
                const stopJson = await loadJSONFromFile(readFilePath_stop);

                const newStop = {
                    'id': id,
                    'stop_id': `${company}_${currStop?.['route']}_${currStop?.['dir']}_${currStop?.['stop']}`,
                    'company': company,
                    'route': currStop?.['route'],
                    'from_tc': currRoute?.[`dest_tc`],
                    'from_en': currRoute?.[`dest_en`],
                    'to_tc': currRoute?.[`orig_tc`],
                    'to_en': currRoute?.[`orig_en`],
                    'dir': currStop?.['dir'],
                    'seq': currStop?.['seq'],
                    'stop': currStop?.['stop'],
                    'name_tc': stopJson?.['data']?.[`name_tc`],
                    'name_en': stopJson?.['data']?.[`name_en`],
                    'lat': stopJson?.['data']?.['lat'],
                    'long': stopJson?.['data']?.['long'],
                }

                currRouteStopList.push(newStop);
            }

            routeStopList[id] = currRouteStopList;
        }

        const readFilePath_outbound = `./download/ctb/raw/routeStop/${currRoute?.['route']}_outbound.json`;
        const routeStopJson_outbound = await loadJSONFromFile(readFilePath_outbound);

        if (routeStopJson_outbound?.['data'] && routeStopJson_outbound?.['data'].length > 0)
        {
            const id = `${company}_${currRoute?.['route']}_O`;

            const newRoute = {
                'id': id,
                'company': company,
                'route': currRoute?.['route'],
                'from_tc': currRoute?.[`orig_tc`],
                'from_en': currRoute?.[`orig_en`],
                'to_tc': currRoute?.[`dest_tc`],
                'to_en': currRoute?.[`dest_en`],
                'dir': 'O'
            }

            routeList.push(newRoute);

            const currRouteStopList = [];
            for (var j = 0; j < routeStopJson_outbound?.['data'].length; j++)
            {
                const currStop = routeStopJson_outbound?.['data'][j];

                const readFilePath_stop = `./download/ctb/raw/stop/${currStop?.['stop']}.json`;
                const stopJson = await loadJSONFromFile(readFilePath_stop);

                const newStop = {
                    'id': id,
                    'stop_id': `${company}_${currStop?.['route']}_${currStop?.['dir']}_${currStop?.['stop']}`,
                    'company': company,
                    'route': currStop?.['route'],
                    'from_tc': currRoute?.[`orig_tc`],
                    'from_en': currRoute?.[`orig_en`],
                    'to_tc': currRoute?.[`dest_tc`],
                    'to_en': currRoute?.[`dest_en`],
                    'dir': currStop?.['dir'],
                    'seq': currStop?.['seq'],
                    'stop': currStop?.['stop'],
                    'name_tc': stopJson?.['data']?.[`name_tc`],
                    'name_en': stopJson?.['data']?.[`name_en`],
                    'lat': stopJson?.['data']?.['lat'],
                    'long': stopJson?.['data']?.['long'],
                }

                currRouteStopList.push(newStop);
            }

            routeStopList[id] = currRouteStopList;
        }
    }

    await saveJSONToFile(`./download/ctb/output/routeList_ctb.json`, routeList);
    await saveJSONToFile(`./download/ctb/output/routeStopList_ctb.json`, routeStopList);
}

export { downloadRouteListCtb, downloadRouteStopCtb, downloadStopCtb, parseJsonCtb }