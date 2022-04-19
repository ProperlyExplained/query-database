# query-database

Execute a query that runs in all columns of all tables and return the tables, columns and rows.

Like <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> in some code editors, but with a database.

## Examples

Find all tables containing "Michael" in any row in any column and list for each table the colums and for each column the rows containing "Michael."
```sh
query-database -D sakila -w '`x` like "%Michael%"'
```

Same thing but using another name to reference the column
```sh
query-database -D sakila -c 'column' -w '`column` like "%Michael%"'
```

## Install

```
npm install -g query-database
```
