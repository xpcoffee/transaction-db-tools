# Transaction Database Tools

These are utilites to work with a DB of transactions. This README serves as a playbook.

Related resources:

- [https://github.com/xpcoffee/bank-statement-parse](bank-statement-parse) - turns bank statements into a standard JSON output

## Creating the transaction database tables

Use `create-tables.sql`.

Example using SQLite:

```bash
sqlite3 transactions.sqlite < create-tables.sql
```

## Building the project

```bash
yarn build
```

## Insert transactions from a standard JSON statement

Example using SQLite:

```bash
node build/json-to-sql.js -f /path/to/json-statement.json > output.sql
sqlite3 -header transactions.sqlite < output.sql
```

## Installing the binary on your system

```bash
npm link
```