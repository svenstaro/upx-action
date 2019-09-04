import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import { run } from '../src/action';

beforeAll(() => {
    if (os.type() == "Linux") {
        child_process.execSync("wget -c https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-linux-amd64")
        fs.chmodSync("proxyboi-linux-amd64", "755");
        process.env["INPUT_FILE"] = "proxyboi-linux-amd64"
    } else if (os.type() == "Darwin") {
        child_process.execSync("wget -c https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-macos-amd64")
        fs.chmodSync("proxyboi-macos-amd64", "755");
        process.env["INPUT_FILE"] = "proxyboi-macos-amd64"
    } else if (os.type() == "Windows_NT") {
        child_process.execSync("wget -c https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-windows-amd64.exe")
        process.env["INPUT_FILE"] = "proxyboi-windows-amd64.exe"
    }
});

describe('UPX Action', () => {
    it('can compress stuff', async () => {
        await run();
    });
});
