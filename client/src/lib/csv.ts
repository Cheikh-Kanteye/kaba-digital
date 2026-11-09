type Cell = string | number | boolean | Date | null | undefined;

function toCell(value: Cell): string {
  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
  // Une valeur commençant par = + - @ serait exécutée comme une formule par Excel.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Point-virgule et BOM : le fichier s'ouvre correctement dans Excel en français. */
export function toCsv(headers: string[], rows: Cell[][]): string {
  return `﻿${[headers, ...rows].map((row) => row.map(toCell).join(";")).join("\r\n")}`;
}

export function downloadCsv(name: string, headers: string[], rows: Cell[][]): void {
  const url = URL.createObjectURL(new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
