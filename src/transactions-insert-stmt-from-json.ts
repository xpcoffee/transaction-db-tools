import * as program from "commander";
import * as fs from "fs";
import { Statement, Transaction } from "./types";

// Parse command-line input
program
  .version("1.0.0")
  .usage("--statement-file <file> ")
  .option("-f, --statement-file <file>", "The JSON bank statement file")
  .parse(process.argv);

if (!program.statementFile) {
  console.error("Invalid bank statement file. Type --help for more details.");
  process.exit(1);
}

// bank: string, account: string, transaction: Transaction
interface FullTransactionData extends Transaction {
  bank: string;
  account: string;
}

const TRANSACTIONS_TABLE = "transactions";
const TRANSACTIONS_TABLE_JSON_MAPPING = {
  id: (data: FullTransactionData) =>
    `"${data.timeStamp}${data.bank}${data.account}${data.hash}"`,
  bank: (data: FullTransactionData) => `"${data.bank}"`,
  account: (data: FullTransactionData) => `"${data.account}"`,
  desc: (data: FullTransactionData) => `"${data.description}"`,
  amount: (data: FullTransactionData) => data.amountInZAR,
  timestamp: (data: FullTransactionData) => `"${data.timeStamp}"`
};

const transactionToSqliteInsertValue = (bank: string, account: string) => (
  transaction: Transaction
) => {
  const data: FullTransactionData = {
    bank: bank,
    account: account,
    ...transaction
  };

  const values = Object.values(TRANSACTIONS_TABLE_JSON_MAPPING).map(mappingFn =>
    mappingFn(data)
  );

  return `(${values.join(",")})`;
};

try {
  const content = fs.readFileSync(program.statementFile, "utf8");
  const statement: Statement = JSON.parse(content);

  const columns = Object.keys(TRANSACTIONS_TABLE_JSON_MAPPING);
  const values = statement.transactions.map(
    transactionToSqliteInsertValue(statement.bank, statement.account)
  );

  console.log(
    `INSERT INTO ${TRANSACTIONS_TABLE} (${columns.join(
      ","
    )}) VALUES ${values.join(",")}`
  );
} catch (e) {
  console.error(`[ERROR] ${e}`);
}
