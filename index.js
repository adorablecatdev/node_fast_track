import { downloadRouteListCtb, downloadRouteStopCtb, downloadStopCtb, parseJsonCtb } from "./src/functions/ctb.js";
import { downloadRouteListKmb, downloadRouteStopListKmb, downloadStopListKmb, parseJsonKmb, } from "./src/functions/kmb.js";
import { deleteNonCoop, parseJsonKmbCtb } from "./src/functions/kmbctb.js";
import { downloadRouteStopListMtrBus, parseJsonMtrBus } from "./src/functions/mtrbus.js";
import { downloadGmbRouteList, downloadGmbRouteListGmb, downloadRouteStopListGmb, downloadStopGmb, mergeStopCoordinateToRouteStopGmb, parseRouteListGmb, parseRouteStopListGmb } from "./src/functions/gmb.js";
import { downloadRouteListNlb, downloadRouteStopNlb, parseJsonNlb } from "./src/functions/nlb.js";
import { generateVersion, parseUniqueRouteList, parseUniqueRouteMap, parseUniqueRouteStopList, parseUniqueRouteStopListByLocation } from "./src/functions/parseFinal.js";
import { processTimetable } from "./src/functions/timetable.js";
import { createMtrRouteList, downloadMtrRoutStopList, getAllMtrFirstAndLastTrain } from "./src/functions/functions_mtr.js";
import { downloadFerryJson, parseRouteStopListFerry } from "./src/functions/ferry.js";


async function ctb()
{
    await downloadRouteListCtb();
    await downloadRouteStopCtb();
    await downloadStopCtb();
    await parseJsonCtb();

    console.log('CTB Finished');
}

async function kmb()
{
    await downloadRouteListKmb();
    await downloadRouteStopListKmb();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await downloadStopListKmb();
    await parseJsonKmb();

    console.log('KMB Finished');
}

async function kmbctb()
{
    await parseJsonKmbCtb();
    await deleteNonCoop('kmb');
    await deleteNonCoop('ctb');

    console.log('KMBCTB Finished');
}

async function mtrbus()
{
    await downloadRouteStopListMtrBus();
    await parseJsonMtrBus();

    console.log('MTRBUS Finished');
}

async function gmb()
{
    await downloadGmbRouteList();
    await downloadGmbRouteListGmb();
    await parseRouteListGmb();
    await downloadRouteStopListGmb();
    await parseRouteStopListGmb();
    await downloadStopGmb();
    await mergeStopCoordinateToRouteStopGmb();

    console.log('GMB Finished');
}

async function nlb()
{
    await downloadRouteListNlb();
    await downloadRouteStopNlb();
    await parseJsonNlb();

    console.log('NLB Finished');
}

async function mtr()
{
    await downloadMtrRoutStopList();
    await createMtrRouteList();
    // await getAllMtrFirstAndLastTrain();

    console.log('MTR Finished');
}

async function ferry()
{
    await downloadFerryJson();
    await parseRouteStopListFerry();
    console.log('Ferry Finished');
}

async function parseFinal()
{
    await parseUniqueRouteList();
    await parseUniqueRouteMap();
    await parseUniqueRouteStopList();
    await parseUniqueRouteStopListByLocation();
    await processTimetable();
    await generateVersion();

    console.log('Final Output Finished');
}

async function main()
{
    const arg = process.argv[2]?.toLowerCase();

    if (arg == 'ctb' || arg == 'all')
        await ctb();

    if (arg == 'kmb' || arg == 'all')
        await kmb();

    if (arg == 'kmbctb' || arg == 'all')
        await kmbctb();

    if (arg == 'mtrbus' || arg == 'all')
        await mtrbus();

    if (arg == 'gmb' || arg == 'all')
        await gmb();

    if (arg == 'nlb' || arg == 'all')
        await nlb();

    if (arg == 'mtr' || arg == 'all')
        await mtr();

    if (arg == 'ferry' || arg == 'all')
        await ferry();

    if (arg == 'parsefinal' || arg == 'all')
        await parseFinal();
}

main();
