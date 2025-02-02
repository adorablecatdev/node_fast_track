import { downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";


async function downloadRouteListNlb()
{
    const url = 'https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list';
    const downloadFilePath = './download/nlb/raw/route/routeList.json';
    await downloadJSONFile(url, downloadFilePath);
}

async function downloadRouteStopNlb()
{
    const readFilePath = './download/nlb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    var jobCount = routeListJson['routes'].length;
    var downloadedCount = 0;

    for (var i = 0; i < routeListJson['routes'].length; i++)
    {
        // if (i == 10) { break; }
        const url1 = `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId=${routeListJson['routes'][i]['routeId']}`;
        const downloadFilePath1 = `./download/nlb/raw/routeStop/${routeListJson['routes'][i]['routeId']}.json`;
        await downloadJSONFile(url1, downloadFilePath1);

        downloadedCount++;
        console.log('Downloaded ' + downloadedCount + '/' + jobCount);

        if (i % 5 == 0)
        {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
}

async function parseJsonNlb()
{
    const readFilePath = './download/nlb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    const routeList = [];
    const routeStopList = {};

    for (var i = 0; i < routeListJson['routes'].length; i++)
    {
        const currRoute = routeListJson['routes'][i];
        var id = `nlb_${currRoute['routeNo']}_${currRoute['routeId']}`;

        const newRoute = {
            id: id,
            company: 'nlb',
            route: currRoute['routeNo'],
            from_tc: currRoute['routeName_c'].split('>')[0].trim(),
            from_en: currRoute['routeName_e'].split('>')[0].trim(),
            to_tc: currRoute['routeName_c'].split('>')[1].trim(),
            to_en: currRoute['routeName_e'].split('>')[1].trim(),
        }
        routeList.push(newRoute);

        const readFilePath = `./download/nlb/raw/routeStop/${currRoute['routeId']}.json`;
        const routeStopJson = await loadJSONFromFile(readFilePath);

        for (var j = 0; j < routeStopJson['stops'].length; j++)
        {
            const currStop = routeStopJson['stops'][j];

            const newStop = {
                'id': id,
                'stop_id': `nlb_${currRoute['routeId']}_${currRoute['routeNo']}_${currStop['stopId']}`,
                'company': 'nlb',
                'route_id': currRoute['routeId'],
                'route': currRoute['routeNo'],
                'from_tc': currRoute['routeName_c'].split('>')[0].trim(),
                'from_en': currRoute['routeName_e'].split('>')[0].trim(),
                'to_tc': currRoute['routeName_c'].split('>')[1].trim(),
                'to_en': currRoute['routeName_e'].split('>')[1].trim(),
                'stop': currStop['stopId'],
                'name_tc': currStop['stopName_c'],
                'name_en': currStop['stopName_e'],
                'lat': currStop['latitude'],
                'long': currStop['longitude'],
            }

            if (id in routeStopList)
            {
                routeStopList[id].push(newStop);
            }
            else
            {
                const newArr = [newStop];
                routeStopList[id] = newArr;
            }
        }
    }

    await saveJSONToFile(`./download/nlb/output/routeList_nlb.json`, routeList);
    await saveJSONToFile(`./download/nlb/output/routeStopList_nlb.json`, routeStopList);
}

export { downloadRouteListNlb, downloadRouteStopNlb, parseJsonNlb }