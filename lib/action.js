"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process = __importStar(require("child_process"));
const core = __importStar(require("@actions/core"));
const download = __importStar(require("download"));
const path = __importStar(require("path"));
function downloadUpx() {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "upx-action-"));
        if (os.type() == "Linux") {
            yield download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-linux-gcc-8-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
            const upx_path = `${tmpdir}/upx`;
            fs.chmodSync(upx_path, "755");
            return upx_path;
        }
        else if (os.type() == "Darwin") {
            yield download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-darwin-clang-1000-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
            const upx_path = `${tmpdir}/upx`;
            fs.chmodSync(upx_path, "755");
            return upx_path;
        }
        else if (os.type() == "Windows_NT") {
            yield download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-570b2d0-appveyor/amd64-win64-msvc-14.1-release/upx-git-570b2d0e88d1.exe?raw=true', tmpdir, { filename: "upx.exe" });
            const upx_path = `${tmpdir}/upx.exe`;
            fs.chmodSync(upx_path, "755");
            return upx_path;
        }
        throw "unsupported OS";
    });
}
function runUpx(file, upx_path) {
    return __awaiter(this, void 0, void 0, function* () {
        child_process.execSync(`strip ${file}`);
        child_process.execSync(`${upx_path} ${file}`);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = core.getInput('file', { required: true });
            if (!fs.existsSync(file)) {
                core.setFailed(`File ${file} wasn't found.`);
            }
            const upx_path = yield downloadUpx();
            yield runUpx(file, upx_path);
        }
        catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    });
}
exports.run = run;
