const xlsx = require('xlsx');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'LISTE POUR APPLICATION LRB.xls');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
} catch (err) {
    console.error("Error reading excel file:", err.message);
}
