import { downloadJSONFile, loadJSONFromFile, returnJson, saveJSONToFile } from "../utilities/file_management.js";

async function downloadGmbRouteList()
{
    const url = 'https://data.etagmb.gov.hk/route';
    const downloadFilePath = './download/gmb/raw/route/routeList_raw.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function downloadGmbRouteListGmb()
{
    const readFilePath1 = './download/gmb/raw/route/routeList_raw.json';
    const routeListJson = await loadJSONFromFile(readFilePath1);

    await subFunction('HKI');
    await subFunction('KLN');
    await subFunction('NT');

    async function subFunction(region)
    {
        const routes = routeListJson['data']['routes'][region];

        for (var i = 0; i < routes.length; i++)
        {
            // if (i == 10) { break; }
            const url2 = `https://data.etagmb.gov.hk/route/${region}/${routes[i]}`;
            const route = await returnJson(url2);

            const routeData = route['data'];
            for (var j = 0; j < routeData.length; j++)
            {
                const routeDirection = routeData[j]['directions'];

                for (var k = 0; k < routeDirection.length; k++)
                {
                    const id = `${region}_${routeData[j]?.['route_code']}_${routeDirection[k]?.['route_seq']}`;

                    const newRouteItem = {
                        'id': id,
                        'route_id': routeData[j]?.['route_id'],
                        'region': region,
                        'route': routeData[j]?.['route_code'],
                    }

                    newRouteItem['route_seq'] = routeDirection[k]?.['route_seq'];
                    newRouteItem['from_tc'] = routeDirection[k]?.[`orig_tc`];
                    newRouteItem['from_en'] = routeDirection[k]?.[`orig_en`];
                    newRouteItem['to_tc'] = routeDirection[k]?.[`dest_tc`];
                    newRouteItem['to_en'] = routeDirection[k]?.[`dest_en`];

                    const saveFilePath1 = `./download/gmb/raw/route/${id}.json`;
                    await saveJSONToFile(saveFilePath1, newRouteItem);
                }
            }

            console.log(`Processing ${i}/${routes.length}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
}

async function parseRouteListGmb()
{
    const readFilePath1 = './download/gmb/raw/route/routeList_raw.json';
    const routeListJson = await loadJSONFromFile(readFilePath1);

    const routeList = [];

    await subFunction('HKI');
    await subFunction('KLN');
    await subFunction('NT');

    async function subFunction(region)
    {
        const routes = routeListJson?.['data']?.['routes']?.[region];

        for (var i = 0; i < routes.length; i++)
        {
            const readFilePath1 = `./download/gmb/raw/route/${region}_${routes[i]}_1.json`;
            const routeJson1 = await loadJSONFromFile(readFilePath1);

            if (routeJson1 != null)
                routeList.push(routeJson1);

            const readFilePath2 = `./download/gmb/raw/route/${region}_${routes[i]}_2.json`;
            const routeJson2 = await loadJSONFromFile(readFilePath2);

            if (routeJson2 != null)
                routeList.push(routeJson2);
        }
    }

    const saveFilePath1 = `./download/gmb/output/routeList.json`;
    await saveJSONToFile(saveFilePath1, routeList);
}

async function downloadRouteStopListGmb()
{
    const readFilePath1 = './download/gmb/output/routeList.json';
    const routeList = await loadJSONFromFile(readFilePath1);

    var currCount = 1;

    for (var i = 0; i < routeList.length; i++)
    {
        const url = `https://data.etagmb.gov.hk/route-stop/${routeList[i]?.['route_id']}/${routeList[i]?.['route_seq']}`;
        const downloadFilePath = `./download/gmb/raw/routeStop/${routeList[i]?.['id']}.json`;
        await downloadJSONFile(url, downloadFilePath);

        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`Downloaded: ${currCount}/${routeList.length}`);
        currCount++;
    }
}

async function parseRouteStopListGmb()
{
    const readFilePath1 = './download/gmb/output/routeList.json';
    const routeList = await loadJSONFromFile(readFilePath1);

    const masterRouteStopList = {};

    for (var i = 0; i < routeList.length; i++)
    {
        const readFilePath1 = `./download/gmb/raw/routeStop/${routeList[i]?.['id']}.json`;
        const routeStopList = await loadJSONFromFile(readFilePath1);

        for (var j=0 ; j<routeStopList?.['data']?.['route_stops'].length ; j++)
        {
            const id = `gmb_${routeList[i]?.['region']}_${routeList[i]?.['route']}_${routeList[i]?.['route_seq']}`;

            const newStop = {
                'id': id,
                'stop_id': `${id}_${routeStopList?.['data']?.['route_stops'][j]?.['stop_id']}`,
                'route_id': routeList[i]?.['route_id'],
                'company': 'gmb',
                'region': routeList[i]?.['region'],
                'route': routeList[i]?.['route'],
                'route_seq': routeList[i]?.['route_seq'],
                'from_tc': routeList[i]?.['from_tc'],
                'from_en': routeList[i]?.['from_en'],
                'to_tc': routeList[i]?.['to_tc'],
                'to_en': routeList[i]?.['to_en'],
                'name_tc': routeStopList?.['data']?.['route_stops'][j][`name_tc`],
                'name_en': routeStopList?.['data']?.['route_stops'][j][`name_en`],
                'stop_seq': routeStopList?.['data']?.['route_stops'][j]?.['stop_seq'],
                'stop': routeStopList?.['data']?.['route_stops'][j]?.['stop_id'],
            }

            if (id in masterRouteStopList)
            {
                masterRouteStopList[id].push(newStop);
            }
            else
            {
                const newArr = [newStop];
                masterRouteStopList[id] = newArr;
            }
        }
    }

    const saveFilePath1 = `./download/gmb/output/routeStopList.json`;
    await saveJSONToFile(saveFilePath1, masterRouteStopList);
}

async function downloadStopGmb()
{
    const readFilePath1 = `./download/gmb/output/routeStopList.json`;
    const routeStopList = await loadJSONFromFile(readFilePath1);

    const stops_object = {};
    const stops_array = [];

    for (const key in routeStopList)
    {
        const currRoute = routeStopList[key];

        for (var i = 0; i < currRoute.length; i++)
        {
            if (currRoute[i]?.['stop'] in stops_object == false)
            {
                stops_object[currRoute[i]?.['stop']] = currRoute[i]?.['stop'];
                stops_array.push(currRoute[i]?.['stop']);
            }
        }
    }

    for (var k = 0; k < stops_array.length; k++)
    {
        const url1 = `https://data.etagmb.gov.hk/stop/${stops_array[k]}`;
        const downloadFilePath = './download/gmb/raw/stop/' + stops_array[k] + '.json';
        await downloadJSONFile(url1, downloadFilePath);

        console.log(`Processing ${k}/${stops_array.length}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

async function mergeStopCoordinateToRouteStopGmb()
{
    const readFilePath = `./download/gmb/output/routeStopList.json`;
    const routeStopList = await loadJSONFromFile(readFilePath);

    const newRouteStopList = {}

    for (const key in routeStopList)
    {
        const currRoute = routeStopList[key];

        for (var i = 0; i < currRoute.length; i++)
        {
            const readFilePath2 = `./download/gmb/raw/stop/${currRoute[i]?.['stop']}.json`;
            const stopJson = await loadJSONFromFile(readFilePath2);

            const stop = currRoute[i];
            stop['lat'] = stopJson?.['data']?.['coordinates']?.['wgs84']?.['latitude'];
            stop['long'] = stopJson?.['data']?.['coordinates']?.['wgs84']?.['longitude'];

            if (key in newRouteStopList)
            {
                newRouteStopList[key].push(stop);
            }
            else
            {
                const newArray = [stop];
                newRouteStopList[key] = newArray;
            }
        }
    }

    const saveFilePath1 = `./download/gmb/output/routeStopList_merge.json`;
    await saveJSONToFile(saveFilePath1, newRouteStopList);
}



export { downloadGmbRouteList, downloadGmbRouteListGmb, parseRouteListGmb, downloadRouteStopListGmb, parseRouteStopListGmb, downloadStopGmb, mergeStopCoordinateToRouteStopGmb }