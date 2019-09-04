import * as fs from 'fs';
import * as os from 'os';
import * as download from 'download';
import * as path from 'path';
import { run } from '../src/action';

beforeAll(async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "upx-action-"));
    if (os.type() == "Linux") {
        await download.default('https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-linux-amd64', tmpdir);
        fs.chmodSync(`${tmpdir}/proxyboi-linux-amd64`, "755");
        process.env["INPUT_FILE"] = `${tmpdir}/proxyboi-linux-amd64`
    } else if (os.type() == "Darwin") {
        await download.default('https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-macos-amd64', tmpdir);
        fs.chmodSync(`${tmpdir}/proxyboi-macos-amd64`, "755");
        process.env["INPUT_FILE"] = `${tmpdir}/proxyboi-macos-amd64`
    } else if (os.type() == "Windows_NT") {
        await download.default('https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-windows-amd64.exe', tmpdir);
        process.env["INPUT_FILE"] = `${tmpdir}/proxyboi-windows-amd64.exe`
    }
});

describe('UPX Action', () => {
    it('can compress stuff', async () => {
        const file_path = process.env["INPUT_FILE"] as string;
        const old_size = fs.statSync(file_path).size;
        await run();
        const new_size = fs.statSync(file_path).size;
        expect(new_size).toBeLessThan(old_size);
    });
});
