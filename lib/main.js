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
function compileUpx() {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs.existsSync("upx")) {
            const checkout_out = child_process.execSync("git checkout devel", { cwd: "upx" });
            core.debug(checkout_out.toString());
            const pull_out = child_process.execSync("git pull", { cwd: "upx" });
            core.debug(pull_out.toString());
        }
        else {
            // Yes, this assumes that devel is always good. UPX seems very stable so we'll take the gamble.
            const clone_out = child_process.execSync("git clone --recursive --single-branch --branch devel git@github.com:upx/upx.git");
            core.debug(clone_out.toString());
        }
        const make_out = child_process.execSync(`make all -j${os.cpus().length}`, { cwd: "upx" });
        core.debug(make_out.toString());
    });
}
function runUpx(file) {
    return __awaiter(this, void 0, void 0, function* () {
        child_process.execSync(`strip ${file}`);
        child_process.execSync(`upx/src/upx.out ${file}`);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = core.getInput('file', { required: true });
            if (!fs.existsSync(file)) {
                core.setFailed(`File ${file} wasn't found.`);
            }
            yield compileUpx();
            yield runUpx(file);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
