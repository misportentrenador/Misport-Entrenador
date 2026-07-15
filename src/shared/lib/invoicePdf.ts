import { Factura, FinanceEntry, DatosFiscalesEmpresa } from '../../types';
import { Persona } from '../../modules/masterdata/types';
import { formatEUR } from './format';

/**
 * Genera y descarga el PDF de una Factura ya emitida (Sprint 19, fase 1).
 * Se ejecuta en el propio navegador, sin backend ni servicio externo.
 * Recibe la Factura ya creada (con su número correlativo definitivo) — esta
 * función solo la representa en PDF, nunca genera un número nuevo.
 *
 * jspdf se importa dinámicamente: es una librería pesada que solo hace
 * falta al generar/descargar una factura, no en el resto de la app — así
 * no engorda el bundle inicial ni el de la Ficha CRM.
 */
export async function downloadInvoicePdf(factura: Factura, entry: FinanceEntry, persona: Persona, empresa: DatosFiscalesEmpresa): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const marginX = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', marginX, y);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${factura.numero}`, 150, y);
  y += 6;
  doc.text(`Fecha: ${factura.fecha}`, 150, y);

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('Emisor', marginX, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(empresa.razonSocial, marginX, y);
  y += 6;
  doc.text(`NIF: ${empresa.nif}`, marginX, y);
  y += 6;
  doc.text(empresa.direccion, marginX, y);

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente', marginX, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(persona.name, marginX, y);
  y += 6;
  doc.text(`NIF/DNI: ${persona.docId || '—'}`, marginX, y);

  y += 16;
  doc.setDrawColor(200);
  doc.line(marginX, y, 190, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Concepto', marginX, y);
  doc.text('Fecha', 110, y);
  doc.text('Importe', 170, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  const concepto = `${entry.service}${entry.groupDays ? ` (${entry.groupDays}d/sem)` : ''} · ${entry.quantity} sesión(es) · ${entry.centerName}`;
  doc.text(concepto, marginX, y, { maxWidth: 85 });
  doc.text(entry.date, 110, y);
  doc.text(formatEUR(factura.baseImponible), 170, y);

  y += 16;
  doc.line(marginX, y, 190, y);
  y += 10;

  doc.text('Base imponible', 130, y);
  doc.text(formatEUR(factura.baseImponible), 170, y);
  y += 7;
  doc.text('IGIC', 130, y);
  doc.text(formatEUR(factura.igicAmount), 170, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 130, y);
  doc.text(formatEUR(factura.total), 170, y);

  doc.save(`factura-${factura.numero}.pdf`);
}
