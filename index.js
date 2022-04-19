const process = require('process');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
.usage('Execute a query that runs in all columns of all tables and return the tables, columns and rows.\nLike Ctrl+Shift+F in some code editors, but with a database.')
.wrap(128)
.options({
  host: {
    alias: 'H',
    default: 'localhost',
    string: true
  },
  user: {
    alias: 'u',
    default: 'root',
    string: true
  },
  password: {
    alias: 'p',
    default: 'root',
    string: true
  },
  database: {
    alias: 'D',
    string: true,
    demandOption: true
  },
  port: {
    alias: 'P',
    default: 3306,
    number: true
  },
  format: {
    alias: 'F',
    default: 'json',
    choices: ['json', 'table'],
  },
  where: {
    alias: 'w',
    string: true,
    demandOption: true,
    description: 'Filter to use in WHERE'
  },
  columnAlias: {
    alias: 'c',
    string: true,
    default: 'x',
    description: 'Alias to reference the column name'
  }
}).example(
  `$0 -D sakila -w '\`x\` like "%Michael%"'`,
  'Find all tables containing "Michael" in any row in any column and list for each table the colums and for each column the rows containing "Michael."\n'
).example(
  `$0 -D sakila -c 'column' -w '\`column\` like "%Michael%"'`,
  'Same thing but using another name to reference the column'
).strict()
.argv;

const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: argv.host,
    user: argv.user,
    password: argv.password,
    database: argv.database,
    rowsAsArray: true
  });
  const output = {};
  let [result] = await connection.query('show tables');
  const tables = result.map(r => r[0]);
  for (const table of tables) {
    output[table] = {};
    [result] = await connection.query(`describe \`${table}\``);
    const columns = result.map(r => r[0]);
    for (const column of columns) {
      try {
        [result] = await connection.query(`select \`${column}\` as \`${argv.columnAlias}\` from \`${table}\` having ${argv.where}`);
        if(result.length) {
          output[table][column] = result.map(r => r[0]);
        }
      } catch (error) {}
    }
    if(!Object.keys(output[table]).length) {
      delete output[table];
    }
  }

  connection.end();

  if(argv.format == 'json') {
    console.log(JSON.stringify(output, null, '    '));
  } else {
    console.table(output);
  }

})();
