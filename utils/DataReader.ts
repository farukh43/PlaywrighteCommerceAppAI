import fs from "fs";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

export class DataProvider {
  // Read and parse a JSON file
  static readJson(filePath: string) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  // Read and parse a CSV file (first row is used as column names)
  static readCsv(filePath: string) {
    const data = fs.readFileSync(filePath);
    return parse(data, {
      columns: true,
      skip_empty_lines: true,
    });
  }

  // Read the first worksheet of an Excel file as rows of values
  static readExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }
}
