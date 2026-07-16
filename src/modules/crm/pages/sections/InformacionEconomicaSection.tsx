import React, { useState } from 'react';
import { Wallet, Plus, Save, FileText, Download, CircleDollarSign } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useCatalog } from '../../../catalog/context/CatalogContext';
import { useMasterData } from '../../../masterdata/context/MasterDataContext';
import { useFinance, getImportePendiente } from '../../../../context/FinanceContext';
import { useApp } from '../../../../context/AppContext';
import { FINANCE_SERVICES } from '../../../../constants';
import { FinanceServiceName } from '../../../../types';
import { BONO_CLIENTE_STATUS_LABELS } from '../../lib/labels';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Spinner } from '../../../../components/ui/Spinner';
import { formatEUR } from '../../../../shared/lib/format';
import { PagoFormFields, PagoFormValue } from '../../../../components/PagoFormFields';
import { RegistrarCobroModal } from '../../../../components/RegistrarCobroModal';
import { downloadInvoicePdf } from '../../../../shared/lib/invoicePdf';
import { Factura } from '../../../../types';

interface Props {
  personaId: string;
}

const emptyBonoForm = { bonoId: '', sessionsRemaining: '1', purchaseDate: new Date().toISOString().slice(0, 10), expiryDate: '' };
const emptyPagoForm = { date: new Date().toISOString().slice(0, 10), trainerName: '', centerName: '', service: FINANCE_SERVICES[0] as FinanceServiceName, groupDays: '1' as '1' | '2' | '3', quantity: '1', manualPrice: '', manualTrainerPay: '', manualCenterPay: '', notes: '' };

/**
 * Información económica — Sprint 10: alta de BonoCliente y de pagos.
 * El consumo automático de bonos (regla oficial, ver BonoCliente en
 * crm/types.ts) se implementó en el Sprint 11 al completar una sesión;
 * cuando no hay saldo suficiente, la regularización manual (Sprint 22) se
 * hace desde la Agenda o el Historial de esta misma Ficha, no aquí.
 */
export const InformacionEconomicaSection: React.FC<Props> = ({ personaId }) => {
  const { bonosCliente } = useCRM();
  const { bonos } = useCatalog();
  const { entries, addEntry, computeTotals, facturas, generarFactura, datosFiscales, cobros } = useFinance();
  const { trainers, centers } = useApp();
  const { personas } = useMasterData();
  const persona = personas.items.find(p => p.id === personaId);

  const misBonos = bonosCliente.items.filter(b => b.personaId === personaId);
  const misPagos = entries.filter(e => e.personaId === personaId).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const totalFacturado = misPagos.reduce((sum, e) => sum + computeTotals(e).billingBase, 0);

  const [bonoForm, setBonoForm] = useState(emptyBonoForm);
  const [pagoForm, setPagoForm] = useState<PagoFormValue>(emptyPagoForm);
  const [bonoSaved, setBonoSaved] = useState(false);
  const [pagoSaved, setPagoSaved] = useState(false);
  const [cobrandoFactura, setCobrandoFactura] = useState<Factura | null>(null);

  const handleCreateBono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonoForm.bonoId) return;
    await bonosCliente.create({
      personaId,
      bonoId: bonoForm.bonoId,
      sessionsRemaining: Number(bonoForm.sessionsRemaining),
      purchaseDate: bonoForm.purchaseDate,
      expiryDate: bonoForm.expiryDate || null,
      status: 'active',
    });
    setBonoForm(emptyBonoForm);
    setBonoSaved(true);
    setTimeout(() => setBonoSaved(false), 2000);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(pagoForm.quantity);
    if (!pagoForm.date || !quantity || quantity <= 0) return;
    addEntry({
      date: pagoForm.date,
      trainerName: pagoForm.trainerName || trainers[0]?.name || '',
      centerName: pagoForm.centerName || centers[0]?.name || '',
      service: pagoForm.service,
      groupDays: pagoForm.service === 'Entrenamiento grupal' ? Number(pagoForm.groupDays) as 1 | 2 | 3 : undefined,
      quantity,
      manualPrice: pagoForm.manualPrice ? Number(pagoForm.manualPrice) : undefined,
      manualTrainerPay: pagoForm.manualTrainerPay ? Number(pagoForm.manualTrainerPay) : undefined,
      manualCenterPay: pagoForm.manualCenterPay ? Number(pagoForm.manualCenterPay) : undefined,
      notes: pagoForm.notes || undefined,
      personaId,
    });
    setPagoForm(emptyPagoForm);
    setPagoSaved(true);
    setTimeout(() => setPagoSaved(false), 2000);
  };

  const datosFiscalesCompletos = !!datosFiscales.razonSocial && !!datosFiscales.nif && !!datosFiscales.direccion;

  const handleGenerarFactura = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !persona) return;
    const factura = generarFactura(entry);
    await downloadInvoicePdf(factura, entry, persona, datosFiscales);
  };

  const handleDescargarFactura = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    const factura = facturas.find(f => f.financeEntryId === entryId);
    if (!entry || !factura || !persona) return;
    await downloadInvoicePdf(factura, entry, persona, datosFiscales);
  };

  if (bonosCliente.loading || bonos.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bonos</h3>
          <span className="text-xs text-gray-500">El consumo automático se aplica al completar cada sesión</span>
        </div>
        {misBonos.length === 0 ? (
          <EmptyState icon={Wallet} message="Sin bonos registrados todavía." />
        ) : (
          <div className="space-y-3 mb-4">
            {misBonos.map(b => {
              const producto = bonos.items.find(p => p.id === b.bonoId);
              return (
                <div key={b.id} className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{producto?.name ?? b.bonoId}</p>
                    <p className="text-xs text-gray-500 mt-1">Comprado: {b.purchaseDate.slice(0, 10)} · {b.sessionsRemaining} sesiones restantes{b.expiryDate ? ` · Caduca: ${b.expiryDate.slice(0, 10)}` : ''}</p>
                  </div>
                  <Badge tone={b.status === 'active' ? 'success' : 'neutral'}>{BONO_CLIENTE_STATUS_LABELS[b.status]}</Badge>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleCreateBono} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-4 border-t border-gray-800">
          <Select label="Bono (Catálogo)" value={bonoForm.bonoId} onChange={e => setBonoForm(f => ({ ...f, bonoId: e.target.value }))} required>
            <option value="">Selecciona un bono</option>
            {bonos.items.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <Input label="Sesiones" type="number" min="1" value={bonoForm.sessionsRemaining} onChange={e => setBonoForm(f => ({ ...f, sessionsRemaining: e.target.value }))} />
          <Input label="Fecha de compra" type="date" value={bonoForm.purchaseDate} onChange={e => setBonoForm(f => ({ ...f, purchaseDate: e.target.value }))} />
          <Input label="Caducidad (opcional)" type="date" value={bonoForm.expiryDate} onChange={e => setBonoForm(f => ({ ...f, expiryDate: e.target.value }))} />
          <div className="sm:col-span-4 flex items-center gap-4">
            <Button type="submit"><Plus size={16} /> Crear bono</Button>
            {bonoSaved && <span className="text-green-400 text-sm font-bold">Bono creado ✓</span>}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Historial de pagos</h3>
          <span className="text-sm text-white font-bold">Total facturado: {formatEUR(totalFacturado)}</span>
        </div>
        {!datosFiscalesCompletos && (
          <p className="text-xs text-misportOrange mb-3">
            Para generar facturas, completa antes los datos fiscales de la empresa en Finanzas.
          </p>
        )}
        {misPagos.length === 0 ? (
          <EmptyState message="Sin pagos registrados todavía." />
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                <tr><th className="px-4 py-2">Fecha</th><th className="px-4 py-2">Servicio</th><th className="px-4 py-2 text-right">Importe</th><th className="px-4 py-2">Factura</th><th className="px-4 py-2 text-right">Acciones</th></tr>
              </thead>
              <tbody>
                {misPagos.map(p => {
                  const factura = facturas.find(f => f.financeEntryId === p.id);
                  const pendiente = factura ? getImportePendiente(factura, cobros) : 0;
                  const cobrado = factura ? factura.total - pendiente : 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-800">
                      <td className="px-4 py-2 text-white">{p.date}</td>
                      <td className="px-4 py-2">{p.service}{p.groupDays ? ` (${p.groupDays}d)` : ''}</td>
                      <td className="px-4 py-2 text-right text-white">{formatEUR(computeTotals(p).billingBase)}</td>
                      <td className="px-4 py-2">
                        {factura ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white">{factura.numero}</span>
                            <Badge tone={factura.estado === 'cobrada' ? 'success' : factura.estado === 'anulada' ? 'neutral' : 'info'}>
                              {factura.estado === 'emitida' ? 'Emitida' : factura.estado === 'cobrada' ? 'Cobrada' : factura.estado === 'anulada' ? 'Anulada' : 'Borrador'}
                            </Badge>
                            {factura.estado === 'emitida' && pendiente > 0 && (
                              <span className="text-xs text-misportOrange">
                                {cobrado > 0 ? `Cobrado parcialmente: ${formatEUR(cobrado)} · Pendiente: ${formatEUR(pendiente)}` : `Pendiente: ${formatEUR(pendiente)}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">Sin facturar</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {factura ? (
                            <>
                              {factura.estado === 'emitida' && (
                                <button onClick={() => setCobrandoFactura(factura)} className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300">
                                  <CircleDollarSign size={12} /> Registrar cobro
                                </button>
                              )}
                              <button onClick={() => handleDescargarFactura(p.id)} className="flex items-center gap-1 text-xs font-bold text-misportBlue hover:text-blue-400">
                                <Download size={12} /> PDF
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleGenerarFactura(p.id)}
                              disabled={!datosFiscalesCompletos || !persona?.docId}
                              title={!persona?.docId ? 'El cliente no tiene DNI/NIF registrado' : undefined}
                              className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <FileText size={12} /> Generar factura
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={handleRegisterPayment} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-4 border-t border-gray-800">
          <PagoFormFields value={pagoForm} onChange={setPagoForm} trainers={trainers} centers={centers} showAdvanced />
          <div className="sm:col-span-4 flex items-center gap-4">
            <Button type="submit"><Save size={16} /> Registrar pago</Button>
            {pagoSaved && <span className="text-green-400 text-sm font-bold">Pago registrado ✓</span>}
          </div>
        </form>
      </Card>

      {cobrandoFactura && (
        <RegistrarCobroModal factura={cobrandoFactura} open onClose={() => setCobrandoFactura(null)} />
      )}
    </div>
  );
};
