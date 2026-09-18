/**
 * @fileoverview Servicio de Exportación a Excel.
 * Proporciona funcionalidad para generar archivos Excel (.xlsx)
 * a partir de datos y definiciones de columnas.
 */
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  /**
   * Genera un archivo Excel en memoria a partir de datos y encabezados.
   * @param sheetName - Nombre de la hoja del libro
   * @param headers - Definición de columnas (header, key, width opcional)
   * @param data - Arreglo de objetos con los datos a exportar
   * @returns Buffer con el contenido del archivo Excel
   */
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
