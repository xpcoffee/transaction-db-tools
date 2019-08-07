#!/usr/bin/env node

import * as program from "commander";
import * as fs from "fs";
import { Statement, Transaction } from "./types";

// Parse command-line input
program
  .version("1.0.0")
  .usage("<json-data> | --file <file>")
  .option(
    "-f, --file <file>",
    "Path to the file containing a JSON bank statement"
  )
  .option("<json-data>", "JSON bank statement data")
  .parse(process.argv);

async function main(program) {
  try {
    const content = await getContent(program);

    if (!content) {
      console.error(
        "[ERROR] Cannot find content to parse. Either directly provide JSON content or point to a JSON file."
      );
      console.error("Usage: " + program.name() + " " + program.usage());
      process.exit(1);
    }

    const statement: Statement = JSON.parse(content);
    const jsonToSql = toSqlValueWith(statement.bank, statement.account);

    const columns = Object.keys(JSON_TO_SQL_VALUE_MAP).join(",");
    const values = statement.transactions.map(jsonToSql).join(",");

    console.log(
      `INSERT INTO ${TRANSACTIONS_TABLE} (${columns}) VALUES ${values};`
    );
  } catch (e) {
    console.error(`[ERROR] ${e}`);
  }
}

function getContent(program): Promise<string> {
  if (program.file) {
    return new Promise((resolve, reject) =>
      fs.readFile(program.file, { encoding: "utf8" }, (err, data) => {
        err ? reject(err) : resolve(data);
      })
    );
  } else if (program.args[0]) {
    return new Promise(resolve => resolve(program.args[0]));
  } else {
    // Piped data
    return new Promise(resolve => {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", resolve);
    });
  }
}

/**
 * Represents the total data needed to insert a transaction into the DB.
 * JSON transactions don't have the bank and account at a row level - these need to be added.
 */
interface FullTransactionData extends Transaction {
  bank: string;
  account: string;
}

const TRANSACTIONS_TABLE = "transactions";

/**
 *  Holds functions that map JSON transaction values to values needed in the SQL statement.
 */

const JSON_TO_SQL_VALUE_MAP = {
  id: (data: FullTransactionData) =>
    `"${data.timeStamp}${data.bank}${data.account}${data.hash}"`,
  bank: (data: FullTransactionData) => `"${data.bank}"`,
  account: (data: FullTransactionData) => `"${data.account}"`,
  desc: (data: FullTransactionData) => `"${data.description}"`,
  amount: (data: FullTransactionData) => data.amountInZAR,
  timestamp: (data: FullTransactionData) => `"${data.timeStamp}"`,
  balance: (data: FullTransactionData) => data.balance
};

// Function to map JSON transaction to SQL values
/**
 * Transform a JSON transaction to the value-row string required in the SQL statement;
 * @param data
 */
function toSqlValue(data: FullTransactionData) {
  const values = Object.values(JSON_TO_SQL_VALUE_MAP)
    .map(mappingFn => mappingFn(data))
    .join(",");
  return `(${values})`;
}

/**
 * Pre-populates part of the FullTransactionData used in the toSqlValue transform.
 *
 * @param bank  The transaction's bank.
 * @param account  The transaction's account.
 */
function toSqlValueWith(bank: string, account: string) {
  return (transaction: Transaction): string => {
    // Collect all the data needed
    const data: FullTransactionData = {
      bank: bank,
      account: account,
      ...transaction
    };

    return toSqlValue(data);
  };
}

//--- Run the script ---
main(program);
