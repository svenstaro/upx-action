"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const glob = __importStar(require("glob"));
// @ts-ignore
const path = __importStar(require("path"));
function downloadUpx() {
    return __awaiter(this, void 0, void 0, function* () {
        const upx_version = '4.0.2';
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'upx-action-'));
        if (os.type() == 'Linux') {
            yield exec.exec('curl', [
                '-LO',
                `https://github.com/upx/upx/releases/download/v${upx_version}/upx-${upx_version}-amd64_linux.tar.xz`
            ], { cwd: tmpdir });
            yield exec.exec('tar', [
                'xvJf',
                `upx-${upx_version}-amd64_linux.tar.xz`,
                '--strip-components=1',
                `upx-${upx_version}-amd64_linux/upx`
            ], { cwd: tmpdir });
            return `${tmpdir}/upx`;
        }
        else if (os.type() == 'Darwin') {
            yield exec.exec(`brew install upx`);
            return 'upx';
        }
        else if (os.type() == 'Windows_NT') {
            yield exec.exec(`choco install upx --no-progress --version=${upx_version}`);
            return 'upx';
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
        return paths.concat(glob.sync(pattern).filter(next => fs.lstatSync(next).isFile()));
    }, []);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paths = resolve(core.getInput('files', { required: false }) ||
                core.getInput('file', { required: true }));
            const args = core.getInput('args');
            const strip = core.getInput('strip') || 'true';
            const strip_args = core.getInput('strip_args');
            if (!paths || paths.length == 0) {
                core.error(`Path input: ${paths}`);
                core.setFailed(`No files found.`);
            }
            if (/true/i.test(strip)) {
                core.info('Running strip...');
                for (const file of paths) {
                    const output = yield exec.getExecOutput(`strip ${strip_args} ${file}`);
                    core.debug(output.stdout);
                    core.debug(output.stderr);
                }
            }
            core.info('Downloading UPX...');
            const upx_path = yield downloadUpx();
            core.info('Running UPX...');
            for (const file of paths) {
                const output = yield exec.getExecOutput(`${upx_path} ${args} ${file}`);
                core.debug(output.stdout);
                core.debug(output.stderr);
            }
        }
        catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    });
}
exports.run = run;
