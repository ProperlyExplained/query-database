#!/usr/bin/env node
Command = require('commander').Command;
spawnSync = require('child_process').spawnSync;

const program = new Command();
program
    .requiredOption('-w, --where <where>', "The column name is 'x'")
    .requiredOption('-d, --database <database>')
    .option('-c, --context <num-characters>', 'Maximum width of the Data column in the output. If zero, the column \'data\' is omitted from the output', '100')
    .option('-e, --executable <executable>', undefined, 'mysql')
    .option('-D, --docker-compose <service>', 'The name of the docker-compose.yml service that represent mysql')
    .option('-- <params...>', 'Parameters passed to mysql')
    .addHelpText('after',`
Examples:
qd -w 'x like "%HelloWorld%"' -d my-database -- -uroot -proot
qd -w 'x like "%HelloWorld%"' -d my-database --executable=/absolute/path/to/mysql -- -uroot -proot
qd -w 'x like "%HelloWorld%"' -d my-database --docker-compose=mysql -- -uroot -proot
qd -w 'x like "%HelloWorld%"' -d my-database --docker-compose=mysql --executable=/absolute/path/to/mysql/inside/docker -- -uroot -proot
qd -w 'x like "%HelloWorld%"' -d my-database -c 20 -- -uroot -proot
`);

program.parse();
const options = program.opts();

let contextColumn = options.context > 0 ? `substring(x, 1, ${options.context}) as \`Sample data\`,` : '';
let query =
`select concat(
    'select ${contextColumn} T as \`Table\`, C as \`Column\` from (',
    group_concat(
        concat(
            '(select \`',
            column_name,
            '\` as X, "',
            table_name,
            '" as T, "',
            column_name,
            '" as C from ',
            table_name,
            ' having ${options.where} limit 1)'
        ) separator ' union '
    ),
    ') as TX;'
) from information_schema.columns where table_schema = '${options.database}'`;

let mysql = options.dockerCompose ?
    spawnSync(
        'docker-compose', [
            'exec',
            '-T',
            options.dockerCompose,
            options.executable,
            ...program.args,
            '--silent',
            '--skip-column-names',
            `--execute=set session group_concat_max_len=4294967295; ${query}`
        ]
    ) :
    spawnSync(
        options.executable, [
            ...program.args,
            '--silent',
            '--skip-column-names',
            `--execute=set session group_concat_max_len=4294967295; ${query}`
        ]
    );

if(options.dockerCompose) {
    spawnSync(
        'docker-compose', [
            'exec',
            options.dockerCompose,
            options.executable,
            ...program.args,
            `--execute=${mysql.stdout.toString()}`,
            options.database
        ],
        {stdio: 'inherit'}
    );
} else {
    spawnSync(
        options.executable, [
            ...program.args,
            `--execute=${mysql.stdout.toString()}`,
            options.database
        ],
        {stdio: 'inherit'}
    );
}
