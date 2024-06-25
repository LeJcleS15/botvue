import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface DataRow {
  [key: string]: any;
}

export const exportToExcel = (data: DataRow[], fileName: string = 'aiowallet.xlsx'): void => {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  const excelBuffer: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  saveAs(blob, fileName);
}
