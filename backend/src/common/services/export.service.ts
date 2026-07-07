import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  async generateExcel(
    sheetName: string,
    headers: { header: string; key: string; width?: number }[],
    data: any[],
  ) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = headers.map((h) => ({
      header: h.header,
      key: h.key,
      width: h.width ?? 20,
    }));

    sheet.getRow(1).font = { bold: true };
    data.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
