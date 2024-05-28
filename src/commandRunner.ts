import { exec } from 'child_process'

const PNG_DIFF_BASE = '/home/david/dev/png_diff/target/release';

/**
 * 
 * @param originalImgpath 
 * @param newImgPath 
 * @param heatmapImgPath 
 * @returns 
 */
export function spawnImageDiff(originalImgpath: string, newImgPath: string, heatmapImgPath: string) {
    return new Promise((resolve, reject) => {
        exec(`${PNG_DIFF_BASE}/png_diff ${originalImgpath} ${newImgPath} ${heatmapImgPath}`, (error, stdout, stderr) => {
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