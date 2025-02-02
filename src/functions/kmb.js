import { coopRoutes } from "../utilities/constants.js";
import { downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";

async function downloadRouteListKmb()
{
    const url = 'https://data.etabus.gov.hk/v1/transport/kmb/route/';
    const downloadFilePath = './download/kmb/raw/route/routeList.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function downloadRouteStopListKmb()
{
    const url = 'https://data.etabus.gov.hk/v1/transport/kmb/route-stop';
    const downloadFilePath = './download/kmb/raw/routeStop/routeStopList.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function downloadStopListKmb()
{
    const url = 'https://data.etabus.gov.hk/v1/transport/kmb/stop';
    const downloadFilePath = './download/kmb/raw/stop/stopList.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function parseJsonKmb()
{
    const readFilePath1 = './download/kmb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath1);
    const routeListObject = {};

    const readFilePath2 = './download/kmb/raw/routeStop/routeStopList.json';
    const routeStopListJson = await loadJSONFromFile(readFilePath2);

    const readFilePath3 = './download/kmb/raw/stop/stopList.json';
    const stopListJson = await loadJSONFromFile(readFilePath3);
    const stopListObject = {};

    for (var j = 0; j < stopListJson?.['data'].length; j++)
    {
        const currStop = stopListJson?.['data'][j];
        stopListObject[currStop?.['stop']] = {
            "name_en": currStop?.['name_en'],
            "name_tc": currStop?.['name_tc'],
            "name_sc": currStop?.['name_sc'],
            "lat": currStop?.['lat'],
            "long": currStop?.['long']
        }
    }

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
            company = 'kmb';

        const id = `${company}_${currRoute?.['route']}_${currRoute?.['bound']}_${currRoute?.['service_type']}`;
        const newRoute = {
            'id': id,
            'company': company,
            'route': currRoute?.['route'],
            'from_tc': currRoute?.[`orig_tc`],
            'from_en': currRoute?.[`orig_en`],
            'to_tc': currRoute?.[`dest_tc`],
            'to_en': currRoute?.[`dest_en`],
            'dir': 'I',
            'serviceType': currRoute?.['service_type']
        }

        routeList.push(newRoute);
        routeListObject[id] = newRoute;
    }

    for (var k = 0; k < routeStopListJson?.['data'].length; k++)
    {
        const currStop = routeStopListJson?.['data'][k];
        var company = '';

        if (currStop?.['route'] in coopRoutes)
            company = 'kmbctb';
        else
            company = 'kmb';

        try
        {
            const id = `${company}_${currStop?.['route']}_${currStop?.['bound']}_${currStop?.['service_type']}`;


            const newStop = {
                'id': id,
                'stop_id': `${company}_${currStop?.['route']}_${currStop?.['bound']}_${currStop?.['stop']}_${currStop?.['service_type']}`,
                'company': company,
                'route': currStop?.['route'],
                'from_tc': routeListObject[id]?.['from_tc'],
                'from_en': routeListObject[id]?.['from_en'],
                'to_tc': routeListObject[id]?.['to_tc'],
                'to_en': routeListObject[id]?.['to_en'],
                'dir': currStop?.['bound'],
                'seq': currStop?.['seq'],
                'stop': currStop?.['stop'],
                'serviceType': currStop?.['service_type'],
                'name_tc': stopListObject[currStop?.['stop']]?.[`name_tc`],
                'name_en': stopListObject[currStop?.['stop']]?.[`name_en`],
                'lat': stopListObject[currStop?.['stop']]?.['lat'],
                'long': stopListObject[currStop?.['stop']]?.['long'],
            }

            if (id in routeStopList == false)
            {
                const newArr = [];
                newArr.push(newStop);
                routeStopList[id] = newArr;
            }
            else
            {
                routeStopList[id].push(newStop);
            }


        }
        catch(err)
        {

        }
    }

    await saveJSONToFile(`./download/kmb/output/routeList_kmb.json`, routeList);
    await saveJSONToFile(`./download/kmb/output/routeStopList_kmb.json`, routeStopList);
}


export { downloadRouteListKmb, downloadRouteStopListKmb, downloadStopListKmb, parseJsonKmb }