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

const formatOriginalDescription = (input: string) => {
  const capitalDescription =
    input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();

  const newDescription = capitalDescription.replace(/\s\s+/g, ' ');
  return newDescription
}

const createDescriptionString = (descriptions: string[]) => {
  let descriptionCharCount = 0;
  let combinedDescription = '';

  descriptions.map((description) => {
    descriptionCharCount += description.length;
    if (descriptionCharCount < 40 ){
      combinedDescription += `${description}, `
    }
    else {
      combinedDescription += `\n${description}, `
      descriptionCharCount = description.length;
    }
  });
  return combinedDescription
}

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
    const transactionInNewCSV = newCSV.some((row) => row.postedDate.includes(original.postedDate))
    const ignoreTransaction = checkIgnoreTransaction(original.description);
    if(ignoreTransaction){
      ignoredTransactions.push(original)
      return;
    }

    // format description
    const formattedDescription = formatOriginalDescription(original.description);

    // row doesn't exist, map the whole object
    if (!transactionInNewCSV) {
      newCSV.push({
        postedDate: original.postedDate,
        descriptions: [formattedDescription],
        debits: [original.debit]
      })
    }
    // row exists, add description and debit
    if (transactionInNewCSV) {
      const matchingIndex = newCSV.findIndex((row) => row.postedDate == original.postedDate)
      newCSV[matchingIndex].descriptions.push(formattedDescription)
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
      postedDate: row.postedDate,
      descriptionString: createDescriptionString(row.descriptions),
      debitString: `= ${row.debits.join(' + ')}`
    });
  });
  return sheetsData;
};

const exportToCSV = (data: SheetsRow[]) => {
  const destination = 'src/data/result.csv'
  let csvData = '';
  data.map((row) => { 
    csvData += `${row.postedDate},"${row.descriptionString}",${row.debitString}\n`
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

    const newResult = transformCSV(result);
    const dataForSheets = prettyForSheets(newResult);

    exportToCSV(dataForSheets);

  });
  res.send(`Hello World! Please check your local for transformed csv`);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});