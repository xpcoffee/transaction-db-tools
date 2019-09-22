# Transaction Database Tools

These are utilities to work with a DB of transactions. This README serves as a playbook.

Related resources:

- [https://github.com/xpcoffee/bank-statement-parse](bank-statement-parse) - turns bank statements into a standard JSON output

## Clone, build and install


Clone

```bash
git clone git@github.com:xpcoffee/transaction-db-tools.git \
&& cd transaction-db-tools
```

Build and install the binaries
```bash
npm build && \
npm -g install
```

Try it out

```bash
json-to-sql --help
```

## Creating the transaction database tables

Use `create-tables.sql`.

Example using SQLite:

```bash
cd sql
sqlite3 transactions.sqlite < create-tables.sql
```

## Insert transactions from a standard JSON statement

Example using SQLite:

```bash
node build/json-to-sql.js -f /path/to/json-statement.json > output.sql
sqlite3 -header transactions.sqlite < output.sql
```

Example for multiple files

```bash
for file in $(find ~/tmp/ -type f); do; sqlite3 transactions.sqlite < <(json-to-sql -f $file); done
```

## Installing the binary on your system

```bash
npm link
```

## Usage with other libraries

To insert files from scratch:

```bash
statement="/path/to/statement.csv"
sqlite3 transactions.sql < <(json-to-sql -f <(parse-bank-statement -b fnb -f "$statement"))
```