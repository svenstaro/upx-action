"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const download_1 = __importDefault(require("download"));
const glob = __importStar(require("glob"));
// @ts-ignore
const decompress_tarxz_1 = __importDefault(require("decompress-tarxz"));
const path = __importStar(require("path"));
function downloadUpx() {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'upx-action-'));
        if (os.type() == 'Linux') {
            yield download_1.default('https://github.com/upx/upx/releases/download/v3.96/upx-3.96-amd64_linux.tar.xz', tmpdir, {
                extract: true,
                plugins: [decompress_tarxz_1.default()]
            });
            const upx_path = `${tmpdir}/upx-3.96-amd64_linux/upx`;
            fs.chmodSync(upx_path, '755');
            return upx_path;
        }
        else if (os.type() == 'Darwin') {
            yield exec.exec('brew install upx');
            return 'upx';
        }
        else if (os.type() == 'Windows_NT') {
            yield download_1.default('https://github.com/upx/upx/releases/download/v3.96/upx-3.96-win64.zip', tmpdir, {
                extract: true
            });
            return `${tmpdir}/upx-3.96-win64/upx.exe`;
        }
        throw 'unsupported OS';
    });
}
function resolve(input) {
    return input
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line)
        .reduce((paths, pattern) => {
        return paths.concat(glob.sync(pattern).filter(path => fs.lstatSync(path).isFile()));
    }, []);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paths = resolve(core.getInput('files', { required: false }) || core.getInput('file'));
            const args = core.getInput('args');
            const strip = core.getInput('strip') || 'true';
            const strip_args = core.getInput('strip_args');
            if (!paths) {
                core.setFailed(`⛔ No files found.`);
            }
            if (/true/i.test(strip)) {
                core.info('🏃 Running strip...');
                for (const file of paths) {
                    yield exec.exec(`strip ${strip_args} ${file}`);
                }
            }
            core.info('⬇️  Downloading UPX...');
            const upx_path = yield downloadUpx();
            core.info('🏃 Running UPX...');
            for (const file of paths) {
                yield exec.exec(`${upx_path} ${args} ${file}`);
            }
        }
        catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    });
}
exports.run = run;
