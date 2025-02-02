import { coopRoutes, reverseDir } from "../utilities/constants.js";
import { loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";
import { findNearestCoopStop } from "../utilities/location.js";

async function parseJsonKmbCtb()
{
    const readFilePath1 = `./download/kmb/output/routeStopList_kmb.json`;
    const routeStopListKmb = await loadJSONFromFile(readFilePath1);

    const readFilePath2 = `./download/ctb/output/routeStopList_ctb.json`;
    const routeStopListCtb = await loadJSONFromFile(readFilePath2);

    const routeStopListCoop = {};

    for (const key in routeStopListKmb)
    {
        const currRouteList = routeStopListKmb[key];
        
        if (currRouteList[0]['route'] in coopRoutes)
        {
            const newArray = [];

            for (var i=0 ; i<currRouteList.length ; i++)
            {
                const currStop = currRouteList[i];
                var ctbRouteStopList = [];
                var dir = currStop['dir'];

                if (currStop['route'] in reverseDir)
                {
                    dir = currStop['dir'] == 'I' ? 'O' : 'I';
                    ctbRouteStopList = routeStopListCtb[`kmbctb_${currStop['route']}_${dir}`];
                }
                else
                {
                    ctbRouteStopList = routeStopListCtb[`kmbctb_${currStop['route']}_${currStop['dir']}`];
                }
                    
                const closestStop = await findNearestCoopStop(currStop['lat'], currStop['long'], ctbRouteStopList);
                currStop['coopStop'] = closestStop;
                currStop['coopDir'] = dir;

                newArray.push(currStop);
            }

            routeStopListCoop[key] = newArray;
        }
    }

    const saveFilePath = `./download/kmbctb/output/routeStopList_kmbctb.json`;
    await saveJSONToFile(saveFilePath, routeStopListCoop);
}

async function deleteNonCoop(company)
{
    const readFilePath1 = `./download/${company}/output/routeStopList_${company}.json`;
    const routeStopList = await loadJSONFromFile(readFilePath1);

    const newRouteStopList = {}
    for (const key in routeStopList)
    {
        if (routeStopList[key][0]['route'] in coopRoutes == false)
        {
            newRouteStopList[key] = routeStopList[key]
        }
    }

    const saveFilePath = `./download/${company}/output/routeStopList_${company}.json`;
    await saveJSONToFile(saveFilePath, newRouteStopList);
}

export { parseJsonKmbCtb, deleteNonCoop }