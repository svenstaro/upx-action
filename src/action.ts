import * as fs from 'fs';
import * as os from 'os';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as download from 'download';
import * as path from 'path';

async function downloadUpx(): Promise<string> {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "upx-action-"));
    if (os.type() == "Linux") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-linux-gcc-8-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
        const upx_path = `${tmpdir}/upx`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    } else if (os.type() == "Darwin") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-darwin-clang-1000-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
        const upx_path = `${tmpdir}/upx`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    } else if (os.type() == "Windows_NT") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-570b2d0-appveyor/amd64-win64-msvc-14.1-release/upx-git-570b2d0e88d1.exe?raw=true', tmpdir, { filename: "upx.exe" });
        const upx_path = `${tmpdir}/upx.exe`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    }
    throw "unsupported OS";
}

export async function run() {
    try {
        const file = core.getInput('file', { required: true });
        const args = core.getInput('args');
        const strip = core.getInput('strip');
        const strip_args = core.getInput('strip_args');

        if (!fs.existsSync(file)) {
            core.setFailed(`⛔ File ${file} wasn't found.`);
        }

        if (/true/i.test(strip)) {
            console.log('🏃 Running strip...');
            await exec.exec(`strip ${strip_args} ${file}`);
        }

        console.log('⬇️ Downloading UPX...');
        const upx_path = await downloadUpx();

        console.log('🏃 Running UPX...');
        await exec.exec(`${upx_path} ${args} ${file}`);
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}
