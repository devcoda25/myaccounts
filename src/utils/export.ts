/**
 * Exports data to a CSV file and triggers a browser download.
 * @param data Array of objects representing the rows to export.
 * @param fileName Name of the file to be downloaded (e.g., 'users.csv').
 * @param headers Optional mapping of keys to human-readable column headers.
 */
export function exportToCsv(data: any[], fileName: string, headers?: Record<string, string>) {
    if (!data || !data.length) return;

    // Get keys from first item if headers mapping not provided
    const columns = headers ? Object.keys(headers) : Object.keys(data[0]);
    const headerRow = headers ? Object.values(headers).join(',') : columns.join(',');

    const csvRows = [headerRow];

    for (const row of data) {
        const values = columns.map(col => {
            let val = row[col];

            // Handle null/undefined
            if (val === null || val === undefined) val = '';

            // Handle dates (if numbers and looks like a timestamp)
            // This is a naive heuristic, can be improved per page
            // if (typeof val === 'number' && val > 1000000000000) {
            //     val = new Date(val).toISOString();
            // }

            // Handle objects (convert to string)
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }

            // Escape quotes and commas
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
