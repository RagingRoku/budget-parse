import express from 'express';
import * as path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse';
import { Transaction, GroupedTransaction, SheetsRow } from './constants/types';
import { headers } from './constants/constants';

const app = express();
const port = 3000;
const csvFilePath = path.resolve(__dirname, '../src/data/transactions.csv');
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

const transformCSV = (originalInput: Transaction[]) => {
  const newCSV:GroupedTransaction[] = [];
  // reverse original array to get transactions from new to old
  originalInput.reverse();
  // ignore last row (the headers)
  originalInput.slice(0, -1).map((original) => {
    // ignore row if no debit
    if (!original.debit){
      console.log('no debit');
      return;
    }
    const transactionInNewCSV = newCSV.some((row) => row.transactionDate.includes(original.transactionDate))
    // row doesn't exist, map the whole object
    if (!transactionInNewCSV) {
      newCSV.push({
        transactionDate: original.transactionDate,
        descriptions: [original.description],
        debits: [original.debit]
      })
    }
    // row exists, add description and debit
    if (transactionInNewCSV) {
      const matchingIndex = newCSV.findIndex((row) => row.transactionDate == original.transactionDate)
      newCSV[matchingIndex].descriptions.push(original.description)
      newCSV[matchingIndex].debits.push(original.debit)
    }
  });
  return newCSV;
}

const prettyForSheets = (groupedTransactions: GroupedTransaction[]) => {
  const sheetsData: SheetsRow[] = [] 
  groupedTransactions.map((row) => {
    sheetsData.push({
      transactionDate: row.transactionDate,
      descriptionString: row.descriptions.join(', '),
      debitString: `= ${row.debits.join(' + ')}`
    });
  });
  return sheetsData;
};

app.get('/', (req, res) => {
  parse(fileContent, {
    delimiter: ',',
    columns: headers,
  }, (error, result: Transaction[]) => {
    // console.log("Result", result);
    console.log("Result type", typeof result);
    const newResult = transformCSV(result);
    console.log("newResult", newResult);
    console.log("newResult type", typeof newResult);

    const dataForSheets = prettyForSheets(newResult);
    console.log("dataForSheets", dataForSheets);
    console.log("dataForSheets type", typeof dataForSheets);


  });
  res.send(`Hello World!`);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});