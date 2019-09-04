import * as fs from 'fs';
import { run } from '../src/action';

beforeEach(() => {
    fs.unlinkSync("upx/src/upx.out");
});

describe('UPX Action', () => {
    it('can compress its own UPX', async () => {
        process.env["INPUT_FILE"] = "upx/src/upx.out"
        await run();
    });
});
