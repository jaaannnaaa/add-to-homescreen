"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../src/config");
// This script creates the src/build folder which contains
// locale specific main.ts and index.ts files
const buildDir = `${__dirname}/../src/build/`;
const sourceMainFilePath = `${__dirname}/../src/main.ts`;
const sourceIndexFilePath = `${__dirname}/../src/index.ts`;
const localesFilePath = `${__dirname}/../src/locales`;
function ensureDirectoryExistence(dirName) {
    if (fs_1.default.existsSync(dirName)) {
        return true;
    }
    fs_1.default.mkdirSync(dirName);
}
function deleteFolder(folderPath) {
    try {
        fs_1.default.rmSync(folderPath, { recursive: true, force: true });
    }
    catch (error) {
        console.error(`Error deleting folder ${folderPath}: ${error.message}`);
    }
}
// Clean out the build dir
deleteFolder(buildDir);
ensureDirectoryExistence(buildDir);
const mainContent = fs_1.default.readFileSync(sourceMainFilePath).toString();
const indexContent = fs_1.default.readFileSync(sourceIndexFilePath).toString();
// Create a main file for each locale
config_1.LOCALES.forEach((locale) => {
    // Create a new main file
    const lines = mainContent
        .replace(`"./types"`, `"../types"`)
        .replace(`"./index"`, `"./index_${locale}"`)
        .split("\n");
    fs_1.default.writeFileSync(path_1.default.join(buildDir, `main_${locale}.ts`), lines.join("\n"));
});
// Create a new index file for each locale
function createLocaleIndexFile(locale) {
    let localeIndexContent = indexContent;
    const localeConfig = Object.assign({}, require(`${localesFilePath}/${locale}.json`));
    // Normalize how the i18n.__() calls are formatted so it makes it easier to
    // in-place replace the config values with the localized language
    localeIndexContent = replaceFunctionCalls(localeIndexContent);
    Object.keys(localeConfig).forEach((localeKey) => {
        const search = new RegExp(`i18n.__\\("${localeKey}"`, 'g');
        const idx = localeIndexContent.search(search);
        if (idx > -1) {
            localeIndexContent = localeIndexContent.replace(search, `i18n.__("${localeConfig[localeKey]}"`);
            delete localeConfig[localeKey];
        }
        else {
            throw new Error("Missing translation in locale [" + locale + "] for key [" + localeKey + "]");
        }
    });
    const linesToRemove = [
        `import { LOCALES } from "./config";`,
        `const config = require`,
        `const LOCALES =`,
    ];
    let lines = localeIndexContent.split("\n").filter((line) => {
        return !linesToRemove.some((lineToRemove) => {
            return line.indexOf(lineToRemove) > -1;
        });
    });
    lines.splice(1, 0, `const LOCALES = ["${locale}"]`);
    const relativeRequires = ["./styles.css", "./simpleI18n", "./types"];
    let localeConfigFound = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < relativeRequires.length; j++) {
            const requirePath = relativeRequires[j];
            if (line.indexOf(`"${requirePath}`) > -1) {
                lines[i] = line.replace(requirePath, "." + requirePath);
                relativeRequires.splice(j, 1);
                break;
            }
        }
        const localeRequireIdx = line.indexOf('require("./locales/"');
        if (localeRequireIdx > -1) {
            lines[i] =
                lines[i].substring(0, localeRequireIdx) +
                    JSON.stringify(localeConfig, null, 2) +
                    ";";
            localeConfigFound = true;
        }
        if (localeConfigFound && relativeRequires.length == 0) {
            break;
        }
    }
    localeIndexContent = lines.join("\n");
    localeIndexContent = removeNewlineSpaceLessThan(localeIndexContent);
    const indexFilePath = path_1.default.join(buildDir, `index_${locale}.ts`);
    fs_1.default.writeFileSync(indexFilePath, localeIndexContent);
}
function removeNewlineSpaceLessThan(input) {
    // Regular expression to match newline, followed by any number of spaces, followed by "<"
    const regex = /\n[\s\t]*</g;
    // Replace all matches with just "<"
    return input.replace(regex, "<");
}
function replaceFunctionCalls(input) {
    // Regular expression to match '.__(' followed by any number of spaces or new lines
    const regex = /\.__\(\s*/g;
    // Replace with '.__('
    return input.replace(regex, ".__(");
}
// Create the "src/build/index_{locale}.ts" file for each locale
// This is targeted by webpack for the build
config_1.LOCALES.forEach(createLocaleIndexFile);
