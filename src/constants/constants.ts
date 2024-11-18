/**
 * headers to use for csv parse which will map the object
 */
export const headers:string[] = [
'transactionDate',
'postedDate',
'CardNumber',
'description',
'category',
'debit',
'credit'
]

/**
 * Transaction strings to remove from parsing
 */
export const ignoreTransactions:string[] = [
    'hulu',
    'astound',
    'netflix',
    'lemonade insurance',
    'travelers'
]