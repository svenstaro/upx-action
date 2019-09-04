import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import * as core from '@actions/core';

async function runUpx(file: string) {
    child_process.execSync(`strip ${file}`);
    child_process.execSync(`upx ${file}`);
}

export async function run() {
    try {
        const file = core.getInput('file', { required: true });

        if (!fs.existsSync(file)) {
            core.setFailed(`File ${file} wasn't found.`);
        }

        await runUpx(file);
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}
