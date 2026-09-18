/**
 * @fileoverview Utilidad para descargar archivos (Excel, PDF) desde la API.
 */

import api from '../api/client';

/** Descarga un archivo desde una URL de la API y lo guarda en disco. */
export async function downloadExport(url: string, filename: string) {
  const res = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
