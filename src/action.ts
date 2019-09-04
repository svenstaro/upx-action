import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import * as core from '@actions/core';

async function compileUpx() {
    if (fs.existsSync("upx")) {
        const checkout_out = child_process.execSync("git checkout devel", { cwd: "upx" });
        core.debug(checkout_out.toString());
        const pull_out = child_process.execSync("git pull", { cwd: "upx" });
        core.debug(pull_out.toString());
    } else {
        // Yes, this assumes that devel is always good. UPX seems very stable so we'll take the gamble.
        const clone_out = child_process.execSync("git clone --recursive --single-branch --branch devel https://github.com/upx/upx.git");
        core.debug(clone_out.toString());
    }
    const make_out = child_process.execSync(`make all -j${os.cpus().length}`, { cwd: "upx" });
    core.debug(make_out.toString());
}

async function runUpx(file: string) {
    child_process.execSync(`strip ${file}`);
    child_process.execSync(`upx/src/upx.out ${file}`);
}

export async function run() {
    try {
        const file = core.getInput('file', { required: true });

        if (!fs.existsSync(file)) {
            core.setFailed(`File ${file} wasn't found.`);
        }

        await compileUpx();
        await runUpx(file);
    } catch (error) {
        core.setFailed(error.message);
    }
}
