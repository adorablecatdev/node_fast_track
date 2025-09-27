import { CompanyName_en, CompanyNameMap, CompanyType, CoopRoutes } from "../../utilities/constants.js";
import { downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../../utilities/file_management.js";

// MARK: DL routeList
async function downloadRouteListCtb()
{
    const url = 'https://rt.data.gov.hk/v2/transport/citybus/route/ctb';
    const downloadFilePath = './download/ctb/raw/route/routeList.json';
    await downloadJSONFile(url, downloadFilePath);
}

// MARK: DL routeStop
async function downloadRouteStopCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    const data = routeListJson?.['data'];

    if (data)
    {
        var jobCount = routeListJson['data'].length;
        var downloadedCount = 0;

        for (var i = 0; i < routeListJson['data'].length; i++)
        {
            // TESTING LIMIT
            if (i == 6) break;
            // TESTING LIMIT

            const url1 = 'https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/' + routeListJson['data'][i]['route'] + '/inbound';
            const downloadFilePath1 = './download/ctb/raw/routeStop/' + routeListJson['data'][i]['route'] + '_inbound.json';
            await downloadJSONFile(url1, downloadFilePath1);

            const url2 = 'https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/' + routeListJson['data'][i]['route'] + '/outbound';
            const downloadFilePath2 = './download/ctb/raw/routeStop/' + routeListJson['data'][i]['route'] + '_outbound.json';
            await downloadJSONFile(url2, downloadFilePath2);

            downloadedCount++;
            console.log('Downloaded routeStop ' + downloadedCount + '/' + jobCount);

            if (i % 5 == 0)
            {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
    }
    else
    {
        console.log('No route data found.');
    }
}

// MARK: DL stop
async function downloadStopCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    // var stopArray = [];
    var stopObject = {};

    // MARK: prep stopObject
    const data = routeListJson?.['data'];
    if (data)
    {
        for (var i = 0; i < routeListJson?.['data'].length; i++)
        {
            const currRoute = routeListJson?.['data'][i];

            if (currRoute && currRoute?.['route'])
            {
                const readFilePath_inbound = `./download/ctb/raw/routeStop/${currRoute?.['route']}_inbound.json`;
                const routeStopJson_inbound = await loadJSONFromFile(readFilePath_inbound);

                const data_inbound = routeStopJson_inbound?.['data'];

                if (data_inbound && data_inbound.length > 0)
                {
                    for (var j = 0; j < data_inbound.length; j++)
                    {
                        if (data_inbound[j]?.['stop'] in stopObject == false)
                        {
                            stopObject[data_inbound[j]?.['stop']] = data_inbound[j]?.['stop'];
                        }
                    }
                }

                const readFilePath_outbound = `./download/ctb/raw/routeStop/${currRoute?.['route']}_outbound.json`;
                const routeStopJson_outbound = await loadJSONFromFile(readFilePath_outbound);

                const data_outbound = routeStopJson_outbound?.['data'];

                if (data_outbound && data_outbound.length > 0)
                {
                    for (var k = 0; k < data_outbound.length; k++)
                    {
                        if (data_outbound[k]?.['stop'] in stopObject == false)
                        {
                            stopObject[data_outbound[k]?.['stop']] = data_outbound[k]?.['stop'];
                        }
                    }
                }
            }
        }
    }
    else
    {
        console.log('No route data found.');
    }

    // MARK: Start DL
    if (Object.keys(stopObject).length > 0)
    {
        var jobCount = Object.keys(stopObject).length;
        var downloadedCount = 0;
        for (var m = 0; m < Object.keys(stopObject).length; m++)
        {
            const url1 = 'https://rt.data.gov.hk/v2/transport/citybus/stop/' + Object.keys(stopObject)[m];
            const downloadFilePath1 = './download/ctb/raw/stop/' + Object.keys(stopObject)[m] + '.json';
            await downloadJSONFile(url1, downloadFilePath1);

            downloadedCount++;
            console.log('Downloaded stop ' + downloadedCount + '/' + jobCount);

            if (m % 5 == 0)
            {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        }
    }
}

// MARK: parse ValidRouteObject
async function parseValidRouteList(lang)
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    const routeList = [];

    if ('data' in routeListJson)
    {
        const routeListData = routeListJson?.['data'];
        for (var i = 0; i < routeListData.length; i++)
        {
            const currRoute = routeListData[i];

            if (currRoute?.['route'] &&
                currRoute?.[`orig_${lang}`] &&
                currRoute?.[`dest_${lang}`]
            )
            {
                const readFilePath = `./download/ctb/raw/routeStop/${routeObject?.['route']}_${direction}.json`;
                const routeStopJson = await loadJSONFromFile(readFilePath);

                if (routeStopJson?.['data'] && routeStopJson?.['data'].length > 0)
                {
                    // routeList.push({
                }
            }



        }
    }

}

// MARK: parseJson
async function parseJsonCtb()
{
    const readFilePath = './download/ctb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(readFilePath);

    const routeList_tc = [];
    const routeList_sc = [];
    const routeList_en = [];

    const routeStopList_tc = {};
    const routeStopList_sc = {};
    const routeStopList_en = {};

    const routeListData = routeListJson?.['data'];

    if (routeListData)
    {
        for (var i = 0; i < routeListData.length; i++)
        {
            const currRoute = routeListData[i];

            await dataParser(currRoute, 'inbound', 'tc', routeList_tc, routeStopList_tc);
            await dataParser(currRoute, 'outbound', 'tc', routeList_tc, routeStopList_tc);
            await dataParser(currRoute, 'inbound', 'en', routeList_en, routeStopList_en);
            await dataParser(currRoute, 'outbound', 'en', routeList_en, routeStopList_en);
            await dataParser(currRoute, 'inbound', 'sc', routeList_sc, routeStopList_sc);
            await dataParser(currRoute, 'outbound', 'sc', routeList_sc, routeStopList_sc);
        }
    }

    await saveJSONToFile(`./download/ctb/output/routeList_ctb_tc.json`, routeList_tc);
    await saveJSONToFile(`./download/ctb/output/routeList_ctb_sc.json`, routeList_sc);
    await saveJSONToFile(`./download/ctb/output/routeList_ctb_en.json`, routeList_en);
    await saveJSONToFile(`./download/ctb/output/routeStopList_ctb_tc.json`, routeStopList_tc);
    await saveJSONToFile(`./download/ctb/output/routeStopList_ctb_sc.json`, routeStopList_sc);
    await saveJSONToFile(`./download/ctb/output/routeStopList_ctb_en.json`, routeStopList_en);
}

async function dataParser(routeObject, direction, lang, routeList, routeStopList)
{

    var company = '';

    if (routeObject?.['route'] in CoopRoutes)
        company = CompanyType.KMBCTB;
    else
        company = CompanyType.CTB;

    const readFilePath = `./download/ctb/raw/routeStop/${routeObject?.['route']}_${direction}.json`;
    const routeStopJson = await loadJSONFromFile(readFilePath);

    const routeStopData = routeStopJson?.['data'];
    if (routeStopData && routeStopData.length > 0)
    {
        const record_id = `${company}_${routeObject?.['route']}_${direction === 'inbound' ? 'I' : 'O'}`;

        const newRoute = {
            'record_id': record_id,
            'company_id': company,
            'company_name': CompanyNameMap?.[lang]?.[company],
            'route_id': routeObject?.['route'],
            'route': routeObject?.['route'],
            'from': routeObject?.[`dest_${lang}`],
            'to': routeObject?.[`orig_${lang}`],
            'dir': 'I'
        }

        routeList.push(newRoute);

        const currRouteStopList = [];
        for (var j = 0; j < routeStopData.length; j++)
        {
            const currStop = routeStopData[j];

            if (currStop?.['stop'] &&
                currStop?.['route'] &&
                currStop?.['dir'] &&
                currStop?.['seq']
            )
            {
                const readFilePath_stop = `./download/ctb/raw/stop/${currStop?.['stop']}.json`;
                const stopJson = await loadJSONFromFile(readFilePath_stop);

                const stopData = stopJson?.['data'];
                if (stopData &&
                    stopData?.['name_tc'] &&
                    stopData?.['name_sc'] &&
                    stopData?.['name_en']
                )
                {
                    const newStop = {
                        'record_id': record_id,
                        'company_id': company,
                        'company_name': CompanyNameMap?.[lang]?.[company],
                        'route_id': currStop?.['route'],
                        'route': currStop?.['route'],
                        'from': routeObject?.[`dest_${lang}`],
                        'to': routeObject?.[`orig_${lang}`],
                        'dir': currStop?.['dir'],
                        'seq': currStop?.['seq'],
                        'stop_id': currStop?.['stop'],
                        'stop_name': stopData?.[`name_${lang}`],
                        'lat': stopData?.['lat'],
                        'long': stopData?.['long'],
                    }

                    currRouteStopList.push(newStop);
                }
            }
        }

        if (currRouteStopList.length > 0)
            routeStopList[record_id] = currRouteStopList;
    }
}
export { downloadRouteListCtb, downloadRouteStopCtb, downloadStopCtb, parseJsonCtb }