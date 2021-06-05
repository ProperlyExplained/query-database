"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var child_process_1 = require("child_process");
var program = new commander_1.Command();
program
    .requiredOption('-w, --where <where>', "The column name is 'x'")
    .requiredOption('-d, --database <database>')
    .option('-c, --context <num-characters>', 'Maximum width of the Data column in the output. If zero, the column \'data\' is omitted from the output', '100')
    .option('-e, --executable <executable>', undefined, 'mysql')
    .option('-D, --docker-compose <service>', 'The name of the docker-compose.yml service that represent mysql')
    .option('-- <params...>', 'Parameters passed to mysql')
    .addHelpText('after', "\nExamples:\nqd -w 'x like \"%HelloWorld%\"' -d my-database -- -uroot -proot\nqd -w 'x like \"%HelloWorld%\"' -d my-database --executable=/absolute/path/to/mysql -- -uroot -proot\nqd -w 'x like \"%HelloWorld%\"' -d my-database --docker-compose=mysql -- -uroot -proot\nqd -w 'x like \"%HelloWorld%\"' -d my-database --docker-compose=mysql --executable=/absolute/path/to/mysql/inside/docker -- -uroot -proot\nqd -w 'x like \"%HelloWorld%\"' -d my-database -c 20 -- -uroot -proot\n");
program.parse();
var options = program.opts();
var contextColumn = options.context > 0 ? "substring(x, 1, " + options.context + ") as `Sample data`," : '';
var query = "select concat(\n    'select " + contextColumn + " T as `Table`, C as `Column` from (',\n    group_concat(\n        concat(\n            '(select `',\n            column_name,\n            '` as X, \"',\n            table_name,\n            '\" as T, \"',\n            column_name,\n            '\" as C from ',\n            table_name,\n            ' having " + options.where + " limit 1)'\n        ) separator ' union '\n    ),\n    ') as TX;'\n) from information_schema.columns where table_schema = '" + options.database + "'";
var mysql = options.dockerCompose ?
    child_process_1.spawnSync('docker-compose', __spreadArray(__spreadArray([
        'exec',
        '-T',
        options.dockerCompose,
        options.executable
    ], program.args), [
        '--silent',
        '--skip-column-names',
        "--execute=set session group_concat_max_len=4294967295; " + query
    ])) :
    child_process_1.spawnSync(options.executable, __spreadArray(__spreadArray([], program.args), [
        '--silent',
        '--skip-column-names',
        "--execute=set session group_concat_max_len=4294967295; " + query
    ]));
if (options.dockerCompose) {
    child_process_1.spawnSync('docker-compose', __spreadArray(__spreadArray([
        'exec',
        options.dockerCompose,
        options.executable
    ], program.args), [
        "--execute=" + mysql.stdout.toString(),
        options.database
    ]), { stdio: 'inherit' });
}
else {
    child_process_1.spawnSync(options.executable, __spreadArray(__spreadArray([], program.args), [
        "--execute=" + mysql.stdout.toString(),
        options.database
    ]), { stdio: 'inherit' });
}
