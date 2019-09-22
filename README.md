# Transaction Database Tools

These are utilities to work with a DB of transactions. This README serves as a playbook.

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

## Creating the transaction database tables

```bash
cd sql
sqlite3 transactions.sqlite < create-tables.sql
```

## Insert data

`json-to-sql` turns `bank-schema` JSON into SQL INSERT statements

```bash
# example using SQLite:
sqlite3 transactions.sql < <(json-to-sql -f /path/to/json-statement.json)
```

**Usage with `parse-bank-statement`**

[parse-bank-statement](https://github.com/xpcoffee/parse-bank-statement) provides a script that's able to take bank CSVs and produce data that complies with [bank-schema](https://github.com/xpcoffee/bank-schema). Together with these tools, a single command can be used to insert statements into a data-store.

```bash
statement="/path/to/statement.csv"
sqlite3 transactions.sql < <(json-to-sql -f <(parse-bank-statement -b fnb -f "$statement"))
```