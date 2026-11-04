"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This script creates a new index_{locale}.html file for each locale
// that we support in the /dist folder.  It modifies the paths in the
// file so it includes the right files for the locale.
const config_1 = require("../src/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const distDir = `${__dirname}/../dist/`;
function updateHtmlFiles() {
    const fileNamesToFix = ["index.html", "debug.html"]
        .concat(config_1.LOCALES.map((locale) => `index_${locale}.html`))
        .map((fileName) => path_1.default.join(distDir, fileName));
    fileNamesToFix.forEach((filePath) => {
        let fileContent = fs_1.default.readFileSync(filePath).toString();
        fileContent = fileContent.split(`"./dist/`).join(`"./`);
        const search = `<ul id="locales">`;
        const idx = fileContent.indexOf(search);
        // Create links to all the different localized index.html files
        const links = config_1.LOCALES.map((locale) => {
            return `<li><a href="index_${locale}.html">${locale.toUpperCase()}</a></li>`;
        });
        fileContent =
            fileContent.substring(0, idx + search.length) +
                links.join("\n") +
                fileContent.substring(idx + search.length);
        // Use the default locale for this built file
        fileContent = fileContent.replace(`show("en")`, `show()`);
        fs_1.default.writeFileSync(filePath, fileContent);
    });
}
function copyRootFiles() {
    // Copy over these files to /dist as the index.html needs them
    const rootFilesToCopy = ["manifest.json", "apple-touch-icon.png"];
    rootFilesToCopy.forEach((fileName) => {
        fs_1.default.cpSync(`${__dirname}/../${fileName}`, `${__dirname}/../dist/${fileName}`);
    });
}
function removeNewlineSpaces(input) {
    // Regular expression to match string literals
    const regex = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    return input.replace(regex, (match) => {
        // Replace "\n" followed by whitespace and "<" within the string literal
        match = match.replace(/\\n\s*</g, "<");
        // Replace "\n" followed by whitespace and "'" within the string literal
        match = match.replace(/\\n\s*'/g, " '");
        // Replace "\n" followed by whitespace and "$" within the string literal
        match = match.replace(/\\n\s*\$/g, " $");
        return match;
    });
}
function removeEmptySpace() {
    // Replace the many instances of repetitive text that looks like "\n       <div"
    // in the add-to-homescreen.min.js file
    const indexFilePaths = ["add-to-homescreen.min.js"]
        .concat(config_1.LOCALES.map((locale) => `add-to-homescreen_${locale}.min.js`))
        .map((fileName) => path_1.default.join(distDir, fileName));
    indexFilePaths.forEach((filePath) => {
        const sourceIndexJsContent = fs_1.default.readFileSync(filePath).toString();
        let indexJsContent = removeNewlineSpaces(sourceIndexJsContent);
        fs_1.default.writeFileSync(filePath, indexJsContent);
    });
}
// function replaceRepetitiveI18nKeys() {
//   const filePaths = ["add-to-homescreen.min.js", "add-to-homescreen.js"].map(
//     (filePath) => path.join(distDir, filePath)
//   );
//   filePaths.forEach((filePath) => {
//     let mainFileContent = fs.readFileSync(filePath).toString();
//     const localeJSON = JSON.parse(
//       fs.readFileSync(`${__dirname}/../src/locales/en.json`).toString()
//     );
//     Object.keys(localeJSON).forEach((key, idx) => {
//       const len = mainFileContent.length;
//       mainFileContent = mainFileContent
//         .split(`"${key}":`)
//         .join(`"k${idx + 1}":`);
//     });
//     fs.writeFileSync(filePath, mainFileContent);
//   });
// }
updateHtmlFiles();
removeEmptySpace();
// replaceRepetitiveI18nKeys();
copyRootFiles();
