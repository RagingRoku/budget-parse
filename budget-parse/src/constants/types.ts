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
    postedDate: string,
    descriptions: string[],
    debits: string[],
};

export type SheetsRow = {
    postedDate: string,
    descriptionString: string,
    debitString: string
};