import * as program from "commander";
import * as fs from "fs";
import { Statement, Transaction } from "./types";

// Parse command-line input
program
  .version("1.0.0")
  .usage("<json-data> | --statement-file <file>")
  .option(
    "-f, --statement-file <file>",
    "File containing a JSON bank statement"
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
    const transactionToSql = getSqlTransform(statement.bank, statement.account);

    const columns = Object.keys(TRANSACTIONS_TABLE_JSON_MAPPING);
    const values = statement.transactions.map(transactionToSql);

    console.log(
      `INSERT INTO ${TRANSACTIONS_TABLE} (${columns.join(
        ","
      )}) VALUES ${values.join(",")}`
    );
  } catch (e) {
    console.error(`[ERROR] ${e}`);
  }
}

function getContent(program): Promise<string> {
  if (program.statementFile) {
    return new Promise((resolve, reject) =>
      fs.readFile(program.statementFile, { encoding: "utf8" }, (err, data) => {
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
 * This interface represents the total data needed to insert a transaction into the DB.
 * JSON transactions don't have the bank and account at a row level - these need to be added.
 */
interface FullTransactionData extends Transaction {
  bank: string;
  account: string;
}

const TRANSACTIONS_TABLE = "transactions";

// Functions that map JSON fields to their respective fields in the transactions table.
const TRANSACTIONS_TABLE_JSON_MAPPING = {
  id: (data: FullTransactionData) =>
    `"${data.timeStamp}${data.bank}${data.account}${data.hash}"`,
  bank: (data: FullTransactionData) => `"${data.bank}"`,
  account: (data: FullTransactionData) => `"${data.account}"`,
  desc: (data: FullTransactionData) => `"${data.description}"`,
  amount: (data: FullTransactionData) => data.amountInZAR,
  timestamp: (data: FullTransactionData) => `"${data.timeStamp}"`
};

// Function to map JSON transaction to SQL values
function toSqlValues(data: FullTransactionData) {
  return Object.values(TRANSACTIONS_TABLE_JSON_MAPPING).map(mappingFn =>
    mappingFn(data)
  );
}

/**
 * Creates a function that can transform a transaction into a value that
 * can be used in a SQL inserts statement.
 *
 * @param bank  The transaction's bank.
 * @param account  The transaction's account.
 */
function getSqlTransform(bank: string, account: string) {
  return (transaction: Transaction): string => {
    // Collect all the data needed
    const data: FullTransactionData = {
      bank: bank,
      account: account,
      ...transaction
    };

    return `(${toSqlValues(data).join(",")})`;
  };
}

//--- Run the script ---
main(program);
