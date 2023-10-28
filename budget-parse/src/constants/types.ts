export type Transaction = {
    transactionDate: string,
    postedDate: string,
    CardNumber: string,
    description: string,
    category: string,
    debit: string,
    credit: string
};

export type GroupedTransaction = {
    transactionDate: string,
    descriptions: string[],
    debits: string[],
};

export type SheetsRow = {
    transactionDate: string,
    descriptionString: string,
    debitString: string
};