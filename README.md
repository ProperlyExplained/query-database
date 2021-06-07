# query-database

Find the table and column that holds the data you are looking for.

```
Table1
+---------+---------+------------------+---------+
| column1 | column2 | column3          | column4 |
+---------+---------+------------------+---------+
| 1       | w       | AAAHelloWorldBBB | a       |
| 2       | r       | t                | b       |
+---------+---------+------------------+---------+

Table2
+---------+---------+---------+------------------+
| column1 | column2 | column3 | column4          |
+---------+---------+---------+------------------+
| q       | 13      | x       | a                |
| e       | 14      | t       | xxxHelloWorldyyy |
+---------+---------+---------+------------------+

Table 3
+---------+---------+---------+---------+
| column1 | column2 | column3 | column4 |
+---------+---------+---------+---------+
| q       | w       | 5       | a       |
| e       | r       | 16      | b       |
+---------+---------+---------+---------+



$ query-database -w 'x like "%HelloWorld%"' -d my-database -- -uroot -proot
+------------------+--------+---------+
| Sample data      | Table  | Column  |
+------------------+--------+---------+
| AAAHelloWorldBBB | Table1 | column3 |
| xxxHelloWorldyyy | Table2 | column4 |
+------------------+--------+---------+

$ query-database -w 'x > 10' -d my-database -- -uroot -proot
+-------------+--------+---------+
| Sample data | Table  | Column  |
+-------------+--------+---------+
| 13          | Table2 | column2 |
| 16          | Table3 | column3 |
+-------------+--------+---------+



$ query-database --help
Usage: query-database [options]

Options:
  -w, --where <where>             The column name is 'x'
  -d, --database <database>
  -c, --context <num-characters>  If zero, the column is omitted from the output (default: "50")
  -e, --executable <executable>    (default: "mysql")
  -D, --docker-compose <service>  The name of the docker-compose.yml service that represent mysql
  -- <params...>                  Parameters passed to mysql
  -h, --help                      display help for command

Examples:
query-database -w 'x like "%HelloWorld%"' -d my-database -- -uroot -proot
query-database -w 'x like "%HelloWorld%"' -d my-database --executable=/absolute/path/to/mysql -- -uroot -proot
query-database -w 'x like "%HelloWorld%"' -d my-database --docker-compose=mysql -- -uroot -proot
query-database -w 'x like "%HelloWorld%"' -d my-database --docker-compose=mysql --executable=/absolute/path/to/mysql/inside/docker -- -uroot -proot
query-database -w 'x like "%HelloWorld%"' -d my-database -c 20 -- -uroot -proot
```

## Install

```
npm install -g query-database
```
