import express from 'express';
import * as path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse';
import { Transaction, GroupedTransaction, SheetsRow } from './constants/types';
import { headers, ignoreTransactions } from './constants/constants';

const app = express();
const port = 3000;
const csvFilePath = path.resolve(__dirname, '../src/data/transactions.csv');
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

const checkIgnoreTransaction = (description: string) => {
  const compareText = description.toLowerCase()
  return ignoreTransactions.some((ignoreItem) => compareText.includes(ignoreItem.toLowerCase()));
};

const transformCSV = (originalInput: Transaction[]) => {
  const newCSV:GroupedTransaction[] = [];
  const ignoredTransactions:Transaction[] = [];

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
    const ignoreTransaction = checkIgnoreTransaction(original.description);
    if(ignoreTransaction){
      ignoredTransactions.push(original)
      return;
    }

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

  console.log("ignoredTransactions", ignoredTransactions);
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

const exportToCSV = (data: SheetsRow[]) => {
  const destination = 'src/data/result.csv'
  let csvData = '';
  data.map((row) => { 
    csvData += `${row.transactionDate},"${row.descriptionString}",${row.debitString}\n`
  });
  console.log('csvData', csvData);
  fs.writeFile(destination, csvData, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  }); 
}

app.get('/', (req, res) => {

  parse(fileContent, {
    delimiter: ',',
    columns: headers,
  }, (error, result: Transaction[]) => {
    if (error) throw error;

    // console.log("Result", result);
    // console.log("Result type", typeof result);
    const newResult = transformCSV(result);
    // console.log("newResult", newResult);
    // console.log("newResult type", typeof newResult);

    const dataForSheets = prettyForSheets(newResult);
    console.log("dataForSheets", dataForSheets);
    console.log("dataForSheets type", typeof dataForSheets);

    exportToCSV(dataForSheets);

  });
  res.send(`Hello World!`);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});