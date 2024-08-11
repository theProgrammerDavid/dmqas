import { exec } from 'child_process'
import fs, { createWriteStream } from 'fs';
import axios from 'axios';
import os from 'os';
import path from 'path';
import { iScreenshotOptions, tPlatform } from './models';

const PNG_DIFF_BASE = '/home/david/dev/png_diff/target/release';

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

class CommandRunner {
    githubUsername: string;
    githubProjectName: string;
    platform: tPlatform;
    tmpBinaryDirPath: string;
    downloadLink: string;
    binaryParentPath: string;

    private latestTag;
    private readonly DOWNLOAD_STUB = 'https://github.com/theProgrammerDavid/png_diff/releases/latest/download';
    private readonly GITHUB_API_BASE = "https://api.github.com/repos/theProgrammerDavid/png_diff"

    constructor() {
        this.latestTag = "";
        this.binaryParentPath = "";
        this.downloadLink = "";
        this.tmpBinaryDirPath = "";
        this.githubUsername = "theProgrammerDavid";
        this.githubProjectName = "png_diff";
        this.platform = "linux";

        switch (process.platform) {
            case 'win32':
                this.platform = 'windows';
                this.downloadLink = `${this.DOWNLOAD_STUB}/png_diff-x86_64-pc-windows-msvc.zip`;
                break;

            case 'linux':
                this.platform = 'linux';
                this.downloadLink = `${this.DOWNLOAD_STUB}/png_diff-x86_64-unknown-linux-gnu.tar.gz`;
                break;

            case 'darwin':
                this.platform = 'macos';
                if (process.arch === 'x64') {
                    this.downloadLink = `${this.DOWNLOAD_STUB}/png_diff-x86_64-apple-darwin.tar.gz`;
                }
                else if (process.arch.includes('arm')) {
                    this.downloadLink = `${this.DOWNLOAD_STUB}/png_diff-aarch64-apple-darwin.tar.gz`;
                }
                break;
        }
    }

    async getLatestTag() {
        const data = await axios.get(`${this.GITHUB_API_BASE}/tags`);
        return data.data[0].name;
    }

    unpackArchive() {
        return new Promise((resolve, reject) => {
            // exec(`tar -xvzf /tmp/png_diff/${LATEST_TAG}/png_diff -C /tmp/png_diff/${LATEST_TAG}/`, (error, stdout, stderr) => {
            exec(`tar -xvzf ${this.tmpBinaryDirPath} -C ${this.binaryParentPath}`, (error, stdout, stderr) => {
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

    async init() {
        this.latestTag = await this.getLatestTag();

        // check if tmpdir exists
        const tmpPath = path.resolve(os.tmpdir(), "png_diff", this.latestTag);
        this.binaryParentPath = tmpPath;
        this.tmpBinaryDirPath = `${tmpPath}/png_diff`;

        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath, { recursive: true });

            await downloadFile('https://github.com/theProgrammerDavid/png_diff/releases/latest/download/png_diff-x86_64-unknown-linux-gnu.tar.gz', this.tmpBinaryDirPath);
            await this.unpackArchive();
        }


    }

    spawnImageDiff(originalImgpath: string, newImgPath: string, heatmapImgPath: string, config: iScreenshotOptions) {
        return new Promise((resolve, reject) => {
            exec(`${this.tmpBinaryDirPath} --intensity ${config.heatmapOpacity} --original-image-path ${originalImgpath} --new-imagepath ${newImgPath} --path-to-heatmap ${heatmapImgPath}`, (error, stdout, stderr) => {
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
}

const cr = new CommandRunner();
export default cr;

// function getTmpDir() {
//     switch (process.platform) {
//         case 'linux':
//         case 'darwin':
//             return `/${os.tmpdir()}/png_diff/${LATEST_TAG}`
//         case 'win32':
//             return os.tmpdir()
//     }
// }

function normalizePath(stub: string) {
    if (process.platform === 'win32')
        return stub.split('/').join('\\');
    return stub;
}

// export async function setup() {
//     LATEST_TAG = await getLatestTag();
//     const folderPath = getTmpDir()!;

//     if (!fs.existsSync(folderPath)) {
//         // folder does not exist
//         // lets create it
//         fs.mkdirSync(folderPath, {
//             recursive: true
//         });
//     }

//     const binaryPath = normalizePath(`${folderPath}/png_diff`);

//     // check if binary does not exist
//     if (!fs.existsSync(binaryPath)) {
//         await downloadFile('https://github.com/theProgrammerDavid/png_diff/releases/latest/download/png_diff-x86_64-unknown-linux-gnu.tar.gz', binaryPath);
//         await unpackArchive();
//     }
// }

// export function unpackArchive() {
//     return new Promise((resolve, reject) => {
//         exec(`tar -xvzf /tmp/png_diff/${LATEST_TAG}/png_diff -C /tmp/png_diff/${LATEST_TAG}/`, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`error: ${error.message}`);
//                 reject(error)
//                 return;
//             }

//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//                 reject(stderr)
//                 return;
//             }

//             resolve(stdout)
//         })
//     })
// }

// /**
//  * 
//  * @param originalImgpath 
//  * @param newImgPath 
//  * @param heatmapImgPath 
//  * @returns 
//  */
// export function spawnImageDiff(originalImgpath: string, newImgPath: string, heatmapImgPath: string) {
//     return new Promise((resolve, reject) => {
//         exec(`/tmp/png_diff/${LATEST_TAG}/png_diff --original-image-path ${originalImgpath} --new-imagepath ${newImgPath} --path-to-heatmap ${heatmapImgPath}`, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`error: ${error.message}`);
//                 reject(error)
//                 return;
//             }

//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//                 reject(stderr)
//                 return;
//             }

//             resolve(stdout)
//         })
//     })
// }