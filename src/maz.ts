#!/usr/bin/env node
import * as compiler from './compiler';
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import * as path from 'path';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install();

const optionDefinitions = [
    { name: 'src', alias: 's', type: String, multiple: false, defaultOption: true },
    { name: 'out', alias: 'o', type: String, multiple: false },
    { name: 'list', alias: 'l', type: String, multiple: false},
    { name: 'brief', alias: 'b', type: Boolean, multiple: false, description: 'Show brief errors'},
    { name: 'undoc', alias: 'u', type: Boolean, mutliple: false, description: 'Warn about undocumented instructions'},
    { name: 'help', alias: 'h', type: Boolean, multiple: false },
    { name: 'path', alias: 'p', type: String, multiple: true, description: 'Search for include files in these paths'}
];
const options = commandLineArgs(optionDefinitions);

function showUsage() {
    console.log(commandLineUsage([
        {
            header: 'MAZ v0.4.6',
            content: 'Macro Assembler for Z80'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }]));
}

if (!options.src || !options.out || options.help) {
    showUsage();
    process.exit(-1);
}

console.log("MAZ v0.4.6");
console.log("WARNING: maz is under development, and likely to break without");
console.log("         warning, and future versions will probably be completely");
console.log("         incompatible.");


console.log(`Assembling ${options.src}`);

let prog = compiler.compile(options.src, {
    trace: false,
    warnUndocumented: options.undoc,
    brief: options.brief,
    searchPaths: options.path
});
if (prog.errors.length === 0) {
    // console.log(JSON.stringify(ast, undefined, 2));
    // console.log(JSON.stringify(symbols, undefined, 2));
    const bytes = prog.getBytes();
    // console.log(JSON.stringify(bytes, undefined, 2));

    fs.writeFileSync(options.out, Buffer.from(bytes));
    console.log(`Written ${bytes.length} ($${bytes.length.toString(16)}) bytes ${options.out}`);
} else {
    console.log(`${prog.errors.length} error${prog.errors.length > 1 ? 's' : ''} found`);
    process.exitCode = 64;
}
if (options.list !== undefined) {
    const list = prog.getList(options.undoc);
    const file = fs.openSync(options.list, 'w');
    for (const line of list) {
        fs.writeSync(file, line);
        fs.writeSync(file, '\n');
    }
    fs.closeSync(file);
    console.log(`List written to ${options.list}`);
}
