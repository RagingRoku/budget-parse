"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const constants_1 = require("./constants/constants");
const app = (0, express_1.default)();
const port = 3000;
const csvFilePath = path.resolve(__dirname, '../src/data/transactions.csv');
const fileContent = fs_1.default.readFileSync(csvFilePath, { encoding: 'utf-8' });
const transformCSV = (originalInput) => {
    const newCSV = [];
    // reverse original array to get transactions from new to old
    originalInput.reverse();
    // ignore last row (the headers)
    originalInput.slice(0, -1).map((original) => {
        // ignore row if no debit
        if (!original.debit) {
            console.log('no debit');
            return;
        }
        const transactionInNewCSV = newCSV.some((row) => row.transactionDate.includes(original.transactionDate));
        // row doesn't exist, map the whole object
        if (!transactionInNewCSV) {
            newCSV.push({
                transactionDate: original.transactionDate,
                descriptions: [original.description],
                debits: [original.debit]
            });
        }
        // row exists, add description and debit
        if (transactionInNewCSV) {
            const matchingIndex = newCSV.findIndex((row) => row.transactionDate == original.transactionDate);
            newCSV[matchingIndex].descriptions.push(original.description);
            newCSV[matchingIndex].debits.push(original.debit);
        }
    });
    return newCSV;
};
const prettyForSheets = (groupedTransactions) => {
    const sheetsData = [];
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
    (0, csv_parse_1.parse)(fileContent, {
        delimiter: ',',
        columns: constants_1.headers,
    }, (error, result) => {
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
//# sourceMappingURL=app.js.map