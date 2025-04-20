import axios from "axios";
import fs from "fs";
import path from "path";
import csvtojson from "csvtojson";
import AdmZip from "adm-zip";

async function downloadCsvAndConvertJsonUtf16(url, filePath)
{
    try
    {
        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath))
        {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const csvData = Buffer.from(response.data).toString('utf16le');
        const jsonArray = await csvtojson().fromString(csvData);

        const output = {};
        for (var i = 1; i < jsonArray.length; i++)
        {
            const currItemArray = Object.values(jsonArray[i]).toString().split('\t');
            const direction = currItemArray[0];
            const weekday = currItemArray[1];
            const time = currItemArray[2];

            if (direction in output == false)
            {
                output[direction] = {};
            }

            if (weekday in output[direction] == false)
            {
                output[direction][weekday] = [];
            }

            output[direction][weekday].push(time);
        }

        const jsonString = JSON.stringify(output, null, 2);

        fs.writeFileSync(filePath, jsonString, { encoding: 'utf-8', flag: 'w' });
    }
    catch (error) 
    {
        // console.error('Error:', error.message);
        // throw error;
    }
}

async function downloadCsvAndConvertJson(url, filePath)
{
    try
    {
        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath))
        {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const response = await axios.get(url);
        const csvData = Buffer.from(response.data).toString('utf-8');

        const jsonArray = await csvtojson().fromString(csvData);
        const jsonString = JSON.stringify(jsonArray, null, 2);

        fs.writeFileSync(filePath, jsonString, { encoding: 'utf-8', flag: 'w' });
        console.log('Json saved: ' + filePath);
    }
    catch (error) 
    {
        // console.error('Error:', error.message);
        // throw error; // Add error propagation
    }
}

async function downloadJSONFile(url, filePath)
{
    try
    {
        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath))
        {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const response = await axios.get(url);
        const jsonData = response.data;
        const jsonString = JSON.stringify(jsonData, null, 2);

        await fs.writeFileSync(filePath, jsonString, { flag: 'w' });
        console.log('Downloaded and saved to:', filePath);
    }
    catch (error)
    {
        console.error('Error during download or write: ' + filePath);
        // throw error; // Re-throw the error to handle it in the calling code
    }
}

async function returnJson(url)
{
    try
    {
        const response = await axios.get(url);
        const jsonData = response.data;
        return jsonData;
    }
    catch (error)
    {
        console.error('Error fetching JSON:', error.message);
        return {};
    }
}

async function loadJSONFromFile(filePath)
{
    try
    {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileData);
    }
    catch (error)
    {
        console.error(error.message);
        return null;
    }
}

async function saveJSONToFile(filePath, data)
{
    try
    {
        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath))
        {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const jsonData = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, jsonData, 'utf-8', { flag: 'w' });
        console.log('JSON file saved successfully: ' + filePath);
    }
    catch (error)
    {
        console.error('Error saving JSON file:', error);
        // throw error; // Re-throw the error to handle it in the calling code
    }
}

async function downloadAndUnzip(url, downloadPath, extractPath)
{
    try
    {
        // Create directories if they don't exist
        if (!fs.existsSync(downloadPath))
        {
            fs.mkdirSync(downloadPath, { recursive: true });
        }
        if (!fs.existsSync(extractPath))
        {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        // Download file
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });

        const zipFile = path.join(downloadPath, 'downloaded.zip');
        fs.writeFileSync(zipFile, response.data);

        // Unzip
        const zip = new AdmZip(zipFile);
        zip.extractAllTo(extractPath, true);

        // Optional: Delete the zip file after extraction
        fs.unlinkSync(zipFile);

        console.log('Download and extraction complete');
    }
    catch (error)
    {
        console.error('Error:', error);
    }
}

export
{
    downloadJSONFile, loadJSONFromFile, saveJSONToFile, downloadAndUnzip, returnJson, downloadCsvAndConvertJson, downloadCsvAndConvertJsonUtf16
}
