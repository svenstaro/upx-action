import * as fs from 'fs';
import { run } from '../src/action';

beforeEach(() => {
    fs.unlink("upx/src/upx.out", err => {
        if(err && err.code != 'ENOENT') {
            throw err;
        }
    });
});

describe('UPX Action', () => {
    it('can compress its own UPX', async () => {
        process.env["INPUT_FILE"] = "upx/src/upx.out"
        await run();
    });
});
