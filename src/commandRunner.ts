import { exec } from 'child_process'
import fs, { createWriteStream } from 'fs';
import axios from 'axios';
import os from 'os';

const PNG_DIFF_BASE = '/home/david/dev/png_diff/target/release';
const GITHUB_API_BASE = "https://api.github.com/repos/theProgrammerDavid/png_diff"

let LATEST_TAG = "";

export async function getLatestTag() {
    const data = await axios.get(`${GITHUB_API_BASE}/tags`)
    return data.data[0].name;
}

export async function downloadFile(fileUrl: string, outputLocationPath: string) {
    const writer = createWriteStream(outputLocationPath);

    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {

        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: any = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    });
}

export async function setup() {
    LATEST_TAG = await getLatestTag();
    const folderPath = `/tmp/png_diff/${LATEST_TAG}`;

    if (!fs.existsSync(folderPath)) {
        // folder does not exist
        // lets create it
        fs.mkdirSync(folderPath, {
            recursive: true
        });
    }

    const binaryPath = `${folderPath}/png_diff`;

    // check if binary does not exist
    if (!fs.existsSync(binaryPath)) {
        await downloadFile('https://github.com/theProgrammerDavid/png_diff/releases/latest/download/png_diff-x86_64-unknown-linux-gnu.tar.gz', binaryPath);
        await unpackArchive();
    }
}

export function unpackArchive() {
    return new Promise((resolve, reject) => {
        exec(`tar -xvzf /tmp/png_diff/${LATEST_TAG}/png_diff -C /tmp/png_diff/${LATEST_TAG}/`, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                reject(error)
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr)
                return;
            }

            resolve(stdout)
        })
    })
}

/**
 * 
 * @param originalImgpath 
 * @param newImgPath 
 * @param heatmapImgPath 
 * @returns 
 */
export function spawnImageDiff(originalImgpath: string, newImgPath: string, heatmapImgPath: string) {
    return new Promise((resolve, reject) => {
        exec(`/tmp/png_diff/${LATEST_TAG}/png_diff --original-image-path ${originalImgpath} --new-imagepath ${newImgPath} --path-to-heatmap ${heatmapImgPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                reject(error)
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr)
                return;
            }

            resolve(stdout)
        })
    })
}