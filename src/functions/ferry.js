import { downloadCsvAndConvertJson, loadJSONFromFile, saveJSONToFile } from "../utilities/file_management.js";
import { ferryCoordination } from "./ferryMetaData.js";

const downloadList = [
    {
        job: '中環 - 坪洲 (英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_pc_timetable_eng.csv',
        path: './download/ferry/raw/central_pc_en.json',
        key: 'central_pc',
        lang: 'en'
    },

    {
        job: '中環 - 坪洲 (繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_pc_timetable_chi.csv',
        path: './download/ferry/raw/central_pc_tc.json',
        key: 'central_pc',
        lang: 'tc'
    },

    {
        job: '中環 - 榕樹灣渡輪服務(收費表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_ysw_timetable_eng.csv',
        path: './download/ferry/raw/central_ysw_en.json',
        key: 'central_ysw',
        lang: 'en'
    },

    {
        job: '中環 - 榕樹灣渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_ysw_timetable_chi.csv',
        path: './download/ferry/raw/central_ysw_tc.json',
        key: 'central_ysw',
        lang: 'tc'
    },

    {
        job: '中環 - 索罟灣渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_skw_timetable_eng.csv',
        path: './download/ferry/raw/central_skw_en.json',
        key: 'central_skw',
        lang: 'en'
    },

    {
        job: '中環 - 索罟灣渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_skw_timetable_chi.csv',
        path: './download/ferry/raw/central_skw_tc.json',
        key: 'central_skw',
        lang: 'tc'
    },

    {
        job: '中環 — 梅窩渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_mw_timetable_eng.csv',
        path: './download/ferry/raw/central_mw_en.json',
        key: 'central_mw',
        lang: 'en'
    },

    {
        job: '中環 — 梅窩渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_mw_timetable_chi.csv',
        path: './download/ferry/raw/central_mw_tc.json',
        key: 'central_mw',
        lang: 'tc'
    },

    {
        job: '坪洲 - 梅窩 - 芝蔴灣 - 長洲渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_pc_mw_cmw_cc_timetable_eng.csv',
        path: './download/ferry/raw/pc_mw_cmw_cc_en.json',
        key: 'pc_mw_cmw_cc',
        lang: 'en'
    },

    {
        job: '坪洲 - 梅窩 - 芝蔴灣 - 長洲渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_pc_mw_cmw_cc_timetable_chi.csv',
        path: './download/ferry/raw/pc_mw_cmw_cc_tc.json',
        key: 'pc_mw_cmw_cc',
        lang: 'tc'
    },

    {
        job: '中環 - 長洲渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_cc_timetable_eng.csv',
        path: './download/ferry/raw/central_cc_en.json',
        key: 'central_cc',
        lang: 'en'
    },

    {
        job: '中環 - 長洲渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_cc_timetable_chi.csv',
        path: './download/ferry/raw/central_cc_tc.json',
        key: 'central_cc',
        lang: 'tc'
    },

    {
        job: '中環 - 愉景灣渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_central_db_timetable_eng.csv',
        path: './download/ferry/raw/central_db_en.json',
        key: 'central_db',
        lang: 'en'
    },

    {
        job: '中環 - 愉景灣渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_central_db_timetable_chi.csv',
        path: './download/ferry/raw/central_db_tc.json',
        key: 'central_db',
        lang: 'tc'
    },

    {
        job: '馬灣 - 中環渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_mawan_c_timetable_eng.csv',
        path: './download/ferry/raw/mawan_c_en.json',
        key: 'mawan_c',
        lang: 'en'
    },

    {
        job: '馬灣 - 中環渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_mawan_c_timetable_chi.csv',
        path: './download/ferry/raw/mawan_c_tc.json',
        key: 'mawan_c',
        lang: 'tc'
    },

    {
        job: '馬灣 - 荃灣渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_mawan_tw_timetable_eng.csv',
        path: './download/ferry/raw/mawan_tw_en.json',
        key: 'mawan_tw',
        lang: 'en'
    },

    {
        job: '馬灣 - 荃灣渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_mawan_tw_timetable_eng.csv',
        path: './download/ferry/raw/mawan_tw_tc.json',
        key: 'mawan_tw',
        lang: 'tc'
    },

    {
        job: '北角 - 紅磡渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_np_hh_timetable_eng.csv',
        path: './download/ferry/raw/np_hh_en.json',
        key: 'np_hh',
        lang: 'en'
    },

    {
        job: '北角 - 紅磡渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_np_hh_timetable_chi.csv',
        path: './download/ferry/raw/np_hh_tc.json',
        key: 'np_hh',
        lang: 'tc'
    },

    {
        job: '北角 - 九龍城渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_np_klnc_timetable_eng.csv',
        path: './download/ferry/raw/np_klnc_en.json',
        key: 'np_klnc',
        lang: 'en'
    },

    {
        job: '北角 - 九龍城渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_np_klnc_timetable_chi.csv',
        path: './download/ferry/raw/np_klnc_tc.json',
        key: 'np_klnc',
        lang: 'tc'
    },

    {
        job: '北角 - 觀塘 - 啟德渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_np_ktak_timetable_eng.csv',
        path: './download/ferry/raw/np_ktak_en.json',
        key: 'np_ktak',
        lang: 'en'
    },

    {
        job: '北角 - 觀塘 - 啟德渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_np_ktak_timetable_chi.csv',
        path: './download/ferry/raw/np_ktak_tc.json',
        key: 'np_ktak',
        lang: 'tc'
    },

    {
        job: '西灣河 - 觀塘渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_swh_kt_timetable_eng.csv',
        path: './download/ferry/raw/swh_kt_en.json',
        key: 'swh_kt',
        lang: 'en'
    },

    {
        job: '西灣河 - 觀塘渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_swh_kt_timetable_chi.csv',
        path: './download/ferry/raw/swh_kt_tc.json',
        key: 'swh_kt',
        lang: 'tc'
    },

    {
        job: '西灣河 - 三家村渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_swh_skt_timetable_eng.csv',
        path: './download/ferry/raw/swh_skt_en.json',
        key: 'swh_skt',
        lang: 'en'
    },

    {
        job: '西灣河 - 三家村渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_swh_skt_timetable_chi.csv',
        path: './download/ferry/raw/swh_skt_tc.json',
        key: 'swh_skt',
        lang: 'tc'
    },

    {
        job: '愉景灣—梅窩渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_db_mw_timetable_eng.csv',
        path: './download/ferry/raw/db_mw_en.json',
        key: 'db_mw',
        lang: 'en'
    },

    {
        job: '愉景灣—梅窩渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_db_mw_timetable_chi.csv',
        path: './download/ferry/raw/db_mw_tc.json',
        key: 'db_mw',
        lang: 'tc'
    },

    {
        job: '屯門—東涌—沙螺灣—大澳渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_tm_tc_slw_to_timetable_eng.csv',
        path: './download/ferry/raw/tm_tc_slw_to_en.json',
        key: 'tm_tc_slw_to',
        lang: 'en'
    },

    {
        job: '屯門—東涌—沙螺灣—大澳渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_tm_tc_slw_to_timetable_chi.csv',
        path: './download/ferry/raw/tm_tc_slw_to_tc.json',
        key: 'tm_tc_slw_to',
        lang: 'tc'
    },

    {
        job: '香港仔—索罟灣（經模達）渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_abd_skw_timetable_eng.csv',
        path: './download/ferry/raw/abd_skw_en.json',
        key: 'abd_skw',
        lang: 'en'
    },

    {
        job: '香港仔—索罟灣（經模達）渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_abd_skw_timetable_chi.csv',
        path: './download/ferry/raw/abd_skw_tc.json',
        key: 'abd_skw',
        lang: 'tc'
    },

    {
        job: '香港仔—北角村—榕樹灣渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_abd_ysw_timetable_eng.csv',
        path: './download/ferry/raw/abd_ysw_en.json',
        key: 'abd_ysw',
        lang: 'en'
    },

    {
        job: '香港仔—北角村—榕樹灣渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_abd_ysw_timetable_chi.csv',
        path: './download/ferry/raw/abd_ysw_tc.json',
        key: 'abd_ysw',
        lang: 'tc'
    },
    {
        job: '中環—紅磡渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_1408%2Fopendata%2Fferry_c_hh_timetable_eng.csv',
        path: './download/ferry/raw/c_hh_en.json',
        key: 'c_hh',
        lang: 'en'
    },
    {
        job: '中環—紅磡渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_1408%2Fopendata%2Fferry_c_hh_timetable_chi.csv',
        path: './download/ferry/raw/c_hh_tc.json',
        key: 'c_hh',
        lang: 'tc'
    },
    {
        job: '馬料水—塔門渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_4912%2Fopendata%2Fferry_mls_tm_timetable_eng.csv',
        path: './download/ferry/raw/mls_tm_en.json',
        key: 'mls_tm',
        lang: 'en'
    },
    {
        job: '馬料水—塔門渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_4912%2Fopendata%2Fferry_mls_tm_timetable_chi.csv',
        path: './download/ferry/raw/mls_tm_tc.json',
        key: 'mls_tm',
        lang: 'tc'
    },
    {
        job: '馬料水—東平洲渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_4912%2Fopendata%2Fferry_mls_tpc_timetable_eng.csv',
        path: './download/ferry/raw/mls_tpc_en.json',
        key: 'mls_tpc',
        lang: 'en'
    },
    {
        job: '馬料水—東平洲渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_4912%2Fopendata%2Fferry_mls_tpc_timetable_chi.csv',
        path: './download/ferry/raw/mls_tpc_tc.json',
        key: 'mls_tpc',
        lang: 'tc'
    },
    {
        job: '塔門—黃石碼頭渡輪服務(航班時間表)(英文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Fen%2Fcontent_4912%2Fopendata%2Fferry_tm_wsp_timetable_eng.csv',
        path: './download/ferry/raw/tm_wsp_en.json',
        key: 'tm_wsp',
        lang: 'en'
    },
    {
        job: '塔門—黃石碼頭渡輪服務(航班時間表)(繁體中文)',
        url: 'https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fwww.td.gov.hk%2Ffilemanager%2Ftc%2Fcontent_4912%2Fopendata%2Fferry_tm_wsp_timetable_chi.csv',
        path: './download/ferry/raw/tm_wsp_tc.json',
        key: 'tm_wsp',
        lang: 'tc'
    }
]

async function downloadFerryJson()
{
    for (var i = 0; i < downloadList.length; i++)
    {
        const url = downloadList[i].url;
        const path = downloadList[i].path;
        await downloadCsvAndConvertJson(url, path);
    }
}

async function parseRouteStopListFerry()
{
    const masterList = {};
    const timeObject = {};

    for (var i = 0; i < downloadList.length; i++)
    {
        const readFilePath = downloadList[i].path;
        const jsonObject = await loadJSONFromFile(readFilePath);

        if (downloadList[i].lang == 'tc')
        {
            for (var j = 0; j < jsonObject.length; j++)
            {
                const direction = jsonObject[j]?.['方向'] || '';
                const serviceDay = serviceDayFormatter(jsonObject[j]?.['服務日子']) || '';
                const serviceTime = timeFormatter(jsonObject[j]?.['服務時段']) || timeFormatter(jsonObject[j]?.['班次']) || '';
                const remark = jsonObject[j]?.['備註'] || ' ';

                if (direction && serviceDay && serviceTime && remark)
                {
                    const route_id = ferryCoordination?.[direction]?.['route_id'] || '';

                    if (route_id in masterList == false) 
                    {
                        masterList[route_id] = {
                            company: 'ferry',
                            route_id: route_id,
                            stop_id: route_id,
                            route_tc: ferryCoordination?.[direction]?.['route_tc'] || '',
                            route_en: ferryCoordination?.[direction]?.['route_en'] || '',
                            from_tc: ferryCoordination?.[direction]?.['from_tc'] || '',
                            to_tc: ferryCoordination?.[direction]?.['to_tc'] || '',
                            from_en: ferryCoordination?.[direction]?.['from_en'] || '',
                            to_en: ferryCoordination?.[direction]?.['to_en'] || '',
                            from_lat: ferryCoordination?.[direction]?.['from_lat'] || '',
                            from_long: ferryCoordination?.[direction]?.['from_long'] || '',
                            to_lat: ferryCoordination?.[direction]?.['to_lat'] || '',
                            to_long: ferryCoordination?.[direction]?.['to_long'] || '',
                            schedule: {}
                        };
                    }

                    if (serviceDay in masterList?.[route_id]?.['schedule'] == false)
                    {
                        masterList[route_id]['schedule'][serviceDay] = [];
                    }

                    masterList?.[route_id]?.['schedule']?.[serviceDay].push(
                        { time: serviceTime, remark: remark }
                    );
                }
            }
        }
    }

    await saveJSONToFile(`./download/ferry/output/routeListFerry.json`, masterList);
    await saveJSONToFile(`./download/ferry/output/timeObject.json`, timeObject);
}

function serviceDayFormatter(serviceDay_in)
{
    if (serviceDay_in)
    {
        const returnValue = serviceDay_in.toString()
            .replaceAll(' ', '')
            .replaceAll('（', '(')
            .replaceAll('）', ')')
            .replaceAll(',', '、');

        return returnValue;
    }
    return '';
}

function timeFormatter(time_in)
{
    if (time_in)
    {
        const val1 = time_in.toString();
        const val2 = val1.replaceAll('noon', 'p.m.');
        const val3 = val2.replaceAll('a.m.', 'AM');
        const val4 = val3.replaceAll('p.m.', 'PM');
        const val5 = val4.replaceAll('am', 'AM');
        const val6 = val5.replaceAll('pm', 'PM');
        const val7 = val6.replaceAll('.', ':');
        const val8 = val7.replaceAll('p:m', 'PM');
        const val9 = val8.replaceAll('PM:', 'PM');

        var val10 = val9;
        if (val9.substring(4, 7) == ':00')
        {
            val10 = val9.substring(0, 4) + val9.substring(7);
            // console.log(val10);
        }
        else if (val9.substring(5, 8) == ':00')
        {
            val10 = val9.substring(0, 5) + val9.substring(8);
            // console.log(val10);
        }

        var val11 = val10;
        if (val11.length == 6 && val11.substring(4, 5) != ' ')
        {
            val11 = val10.substring(0, 4) + ' ' + val10.substring(4);
        }
        else if (val11.length == 7 && val11.substring(4, 5) != ' ' && val11.substring(5, 6) != ' ')
        {
            val11 = val10.substring(0, 5) + ' ' + val10.substring(5);
        }

        return val11;
    }

    return '';

}

export { downloadFerryJson, parseRouteStopListFerry }