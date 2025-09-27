import { CompanyNameMap, CompanyType, CoopRoutes } from "../../utilities/constants.js";
import { downloadJSONFile, loadJSONFromFile, saveJSONToFile } from "../../utilities/file_management.js";

// MARK: Download Files
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

// MARK: Parse Combine
async function parseJsonKmb()
{
    const stopListObject_tc = await prepareStopObject('tc');
    const stopListObject_sc = await prepareStopObject('sc');
    const stopListObject_en = await prepareStopObject('en');

    const { routeList: routeList_tc, routeListObject: routeListObject_tc } = await parseRouteList('tc');
    const { routeList: routeList_sc, routeListObject: routeListObject_sc } = await parseRouteList('sc');
    const { routeList: routeList_en, routeListObject: routeListObject_en } = await parseRouteList('en');

    const routeStopList_tc = await parseRouteStopList('tc', routeListObject_tc, stopListObject_tc);
    const routeStopList_sc = await parseRouteStopList('sc', routeListObject_sc, stopListObject_sc);
    const routeStopList_en = await parseRouteStopList('en', routeListObject_en, stopListObject_en);

    await saveJSONToFile(`./download/kmb/output/routeList_kmb_tc.json`, routeList_tc);
    await saveJSONToFile(`./download/kmb/output/routeList_kmb_sc.json`, routeList_sc);
    await saveJSONToFile(`./download/kmb/output/routeList_kmb_en.json`, routeList_en);

    await saveJSONToFile(`./download/kmb/output/routeStopList_kmb_tc.json`, routeStopList_tc);
    await saveJSONToFile(`./download/kmb/output/routeStopList_kmb_sc.json`, routeStopList_sc);
    await saveJSONToFile(`./download/kmb/output/routeStopList_kmb_en.json`, routeStopList_en);
}

// MARK: Parse Stop
async function prepareStopObject(lang)
{
    const stopListJsonFilePath = './download/kmb/raw/stop/stopList.json';
    const stopListJson = await loadJSONFromFile(stopListJsonFilePath);

    const stopListObject = {};

    if ('data' in stopListJson)
    {
        const data = stopListJson['data'];
        for (var j = 0; j < data.length; j++)
        {
            const currStop = data?.[j];
            if (currStop &&
                'stop' in currStop &&
                'name_tc' in currStop &&
                'name_sc' in currStop &&
                'name_en' in currStop &&
                'lat' in currStop &&
                'long' in currStop)
            {
                stopListObject[currStop?.['stop']] = {
                    "stop_name": currStop?.[`name_${lang}`],
                    "lat": currStop?.['lat'],
                    "long": currStop?.['long']
                }
            }
        }
    }
    else
    {
        console.log("No data in stopListJson");
    }

    return stopListObject;
}

// MARK: Parse RouteList
async function parseRouteList(lang)
{
    const routeListJsonFilePath = './download/kmb/raw/route/routeList.json';
    const routeListJson = await loadJSONFromFile(routeListJsonFilePath);

    const routeList = [];
    const routeListObject = {};

    if ('data' in routeListJson)
    {
        const routeListData = routeListJson['data'];

        for (var i = 0; i < routeListData.length; i++)
        {
            const currRoute = routeListData[i];

            try
            {
                if (currRoute &&
                    'route' in currRoute &&
                    'bound' in currRoute &&
                    'service_type' in currRoute &&
                    'orig_tc' in currRoute &&
                    'orig_sc' in currRoute &&
                    'orig_en' in currRoute &&
                    'dest_tc' in currRoute &&
                    'dest_sc' in currRoute &&
                    'dest_en' in currRoute
                )
                {
                    var company = '';

                    if (currRoute?.['route'] in CoopRoutes)
                        company = CompanyType.KMBCTB;
                    else
                        company = CompanyType.KMB;

                    const record_id = `${company}_${currRoute?.['route']}_${currRoute?.['bound']}_${currRoute?.['service_type']}`;
                    const newRoute = {
                        'record_id': record_id,
                        'company_id': company,
                        'company_name': CompanyNameMap?.[lang]?.[company],
                        'route_id': currRoute?.['route'],
                        'route_name': currRoute?.['route'],
                        'from': currRoute?.[`orig_${lang}`],
                        'to': currRoute?.[`dest_${lang}`],
                        'dir': currRoute?.['bound'],
                        'serviceType': currRoute?.['service_type']
                    };

                    routeList.push(newRoute);
                    routeListObject[record_id] = newRoute;
                }
            }
            catch (err)
            {
                console.log(err);
            }
        }
    }

    console.log(`Total Routes (${lang}): ${routeList.length}`);
    console.log(`Total Route Objects (${lang}): ${Object.keys(routeListObject).length}`);
    return { routeList: routeList, routeListObject: routeListObject };
}

// MARK: Parse RouteStop
async function parseRouteStopList(lang, routeListObject, stopListObject)
{
    const routeStopListJsonFilePath = './download/kmb/raw/routeStop/routeStopList.json';
    const routeStopListJson = await loadJSONFromFile(routeStopListJsonFilePath);

    const routeStopList = {};

    if ('data' in routeStopListJson)
    {

        const routeStopData = routeStopListJson['data'];
        for (var k = 0; k < routeStopData.length; k++)
        {
            const currStop = routeStopData[k];
            var company = '';

            if (currStop?.['route'] in CoopRoutes)
                company = CompanyType.KMBCTB;
            else
                company = CompanyType.KMB;

            try
            {
                const record_id = `${company}_${currStop?.['route']}_${currStop?.['bound']}_${currStop?.['service_type']}`;

                const newStop = {
                    'record_id': record_id,
                    'company_id': company,
                    'company': CompanyNameMap?.[lang]?.[company],
                    'route_id': currStop?.['route'],
                    'route': currStop?.['route'],
                    'from': routeListObject[record_id]?.['from'],
                    'to': routeListObject[record_id]?.['to'],
                    'dir': currStop?.['bound'],
                    'seq': currStop?.['seq'],
                    'serviceType': currStop?.['service_type'],
                    'stop_id': currStop?.['stop'],
                    'stop_name': stopListObject[currStop?.['stop']]?.[`stop_name`],
                    'lat': stopListObject[currStop?.['stop']]?.['lat'],
                    'long': stopListObject[currStop?.['stop']]?.['long'],
                };

                if (record_id in routeStopList == false)
                {
                    const newArr = [];
                    newArr.push(newStop);
                    routeStopList[record_id] = newArr;
                }
                else
                {
                    routeStopList[record_id].push(newStop);
                }
            }
            catch (err)
            {
                console.log(err);
            }
        }
    }

    return routeStopList;
}

export { downloadRouteListKmb, downloadRouteStopListKmb, downloadStopListKmb, parseJsonKmb }