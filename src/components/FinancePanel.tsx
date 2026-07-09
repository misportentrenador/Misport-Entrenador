
import React, { useMemo, useState } from 'react';
import { Euro, Calculator, Save, Trash2, Plus, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFinance } from '../context/FinanceContext';
import { FINANCE_SERVICES, FINANCE_ONLINE_CENTER, DEFAULT_FINANCE_PARAMS } from '../constants';
import { FinanceParams, FinanceServiceName, ServiceRate, FinanceEntry, FinanceEntryTotals } from '../types';

const formatEUR = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

const inputCls =
  'w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm';
// Amber = valor económico fijo (tarifa del Modelo, o un override manual que lo sustituye)
const fixedInputCls =
  'w-full p-2.5 bg-amber-950/40 border border-amber-700/50 rounded-lg text-amber-50 placeholder-amber-700/60 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm';
// Azul = dato variable de la sesión (cambia cada vez que se registra)
const variableInputCls =
  'w-full p-2.5 bg-blue-950/30 border border-blue-800/50 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

// Verde si el resultado es positivo (o cero), rojo si es negativo
const resultColor = (value: number) => (value < 0 ? 'text-red-400' : 'text-green-400');

const ColorLegend: React.FC<{ items: { swatch: string; label: string }[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
    {items.map(it => (
      <span key={it.label} className="flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-sm ${it.swatch}`}></span>
        {it.label}
      </span>
    ))}
  </div>
);

type Agg = { key: string; billingBase: number; netProfit: number; trainerTotal: number; centerTotal: number };

function groupSum(
  rows: { entry: FinanceEntry; totals: FinanceEntryTotals }[],
  keyFn: (e: FinanceEntry) => string
): Agg[] {
  const map = new Map<string, Agg>();
  rows.forEach(({ entry, totals }) => {
    const key = keyFn(entry);
    const cur = map.get(key) ?? { key, billingBase: 0, netProfit: 0, trainerTotal: 0, centerTotal: 0 };
    cur.billingBase += totals.billingBase;
    cur.netProfit += totals.netProfit;
    cur.trainerTotal += totals.trainerTotal;
    cur.centerTotal += totals.centerTotal;
    map.set(key, cur);
  });
  return Array.from(map.values());
}

// --- SUB-TAB: PARÁMETROS ---
const ParametrosTab: React.FC = () => {
  const { params, updateParams } = useFinance();
  const [draft, setDraft] = useState<FinanceParams>(params);
  const [savedMsg, setSavedMsg] = useState(false);

  const updateRate = (service: 'electro' | 'online', field: keyof ServiceRate, value: number) => {
    setDraft(d => ({ ...d, [service]: { ...d[service], [field]: value } }));
  };

  const updateGroupRate = (days: 1 | 2 | 3, field: keyof ServiceRate, value: number) => {
    setDraft(d => ({ ...d, group: d.group.map(g => (g.days === days ? { ...g, [field]: value } : g)) }));
  };

  const handleSave = () => {
    updateParams(draft);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleReset = () => setDraft(DEFAULT_FINANCE_PARAMS);

  const RateRow: React.FC<{ title: string; rate: ServiceRate; onChange: (field: keyof ServiceRate, value: number) => void }> = ({
    title,
    rate,
    onChange,
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-4 bg-gray-900/40 rounded-lg border border-gray-800">
      <div className="sm:col-span-1">
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      <div>
        <label className={labelCls}>Precio (€)</label>
        <input type="number" step="0.5" min="0" className={fixedInputCls} value={rate.price}
          onChange={e => onChange('price', Number(e.target.value))} />
      </div>
      <div>
        <label className={labelCls}>Pago entrenador (€)</label>
        <input type="number" step="0.5" min="0" className={fixedInputCls} value={rate.trainerPay}
          onChange={e => onChange('trainerPay', Number(e.target.value))} />
      </div>
      <div>
        <label className={labelCls}>Pago centro (€)</label>
        <input type="number" step="0.5" min="0" className={fixedInputCls} value={rate.centerPay}
          onChange={e => onChange('centerPay', Number(e.target.value))} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ColorLegend items={[{ swatch: 'bg-amber-600', label: 'Parámetro fijo (Modelo económico)' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>IGIC (%)</label>
          <input type="number" step="0.5" min="0" className={fixedInputCls} value={Math.round(draft.igic * 1000) / 10}
            onChange={e => setDraft(d => ({ ...d, igic: Number(e.target.value) / 100 }))} />
        </div>
        <div>
          <label className={labelCls}>Impuesto sobre beneficio (%)</label>
          <input type="number" step="1" min="0" className={fixedInputCls} value={Math.round(draft.profitTax * 1000) / 10}
            onChange={e => setDraft(d => ({ ...d, profitTax: Number(e.target.value) / 100 }))} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Servicios de precio fijo</h3>
        <RateRow title="Electroestimulación" rate={draft.electro} onChange={(f, v) => updateRate('electro', f, v)} />
        <RateRow title="Entrenamiento online" rate={draft.online} onChange={(f, v) => updateRate('online', f, v)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Entrenamiento grupal (según días/semana)</h3>
        {draft.group.map(g => (
          <RateRow key={g.days} title={`${g.days} día(s)/semana`} rate={g}
            onChange={(f, v) => updateGroupRate(g.days, f, v)} />
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-misportBlue hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg">
          <Save size={16} /> Guardar cambios
        </button>
        <button onClick={handleReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium px-4 py-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all">
          <RotateCcw size={14} /> Restaurar valores por defecto
        </button>
        {savedMsg && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
      </div>
    </div>
  );
};

// --- SUB-TAB: REGISTRAR SESIÓN ---
const RegistroTab: React.FC = () => {
  const { trainers, centers } = useApp();
  const { entries, addEntry, deleteEntry, computeTotals } = useFinance();

  const trainerNames = trainers.map(t => t.name);
  const centerNames = [...centers.map(c => c.name), FINANCE_ONLINE_CENTER];

  const emptyForm = {
    date: new Date().toISOString().slice(0, 10),
    trainerName: trainerNames[0] ?? '',
    centerName: centerNames[0] ?? '',
    service: FINANCE_SERVICES[0] as FinanceServiceName,
    groupDays: '1' as '1' | '2' | '3',
    quantity: '1',
    manualPrice: '',
    manualTrainerPay: '',
    manualCenterPay: '',
    notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(form.quantity);
    if (!form.date || !quantity || quantity <= 0) return;

    addEntry({
      date: form.date,
      trainerName: form.trainerName,
      centerName: form.centerName,
      service: form.service,
      groupDays: form.service === 'Entrenamiento grupal' ? (Number(form.groupDays) as 1 | 2 | 3) : undefined,
      quantity,
      manualPrice: form.manualPrice === '' ? undefined : Number(form.manualPrice),
      manualTrainerPay: form.manualTrainerPay === '' ? undefined : Number(form.manualTrainerPay),
      manualCenterPay: form.manualCenterPay === '' ? undefined : Number(form.manualCenterPay),
      notes: form.notes || undefined,
    });

    setForm(f => ({ ...emptyForm, trainerName: f.trainerName, centerName: f.centerName, service: f.service }));
  };

  const sortedEntries = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="p-5 bg-gray-900/40 rounded-xl border border-gray-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nueva sesión</h3>
          <ColorLegend items={[
            { swatch: 'bg-blue-600', label: 'Dato variable (cambia cada sesión)' },
            { swatch: 'bg-amber-600', label: 'Valor económico fijo / override' },
          ]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Fecha</label>
            <input type="date" className={variableInputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label className={labelCls}>Entrenador</label>
            <select className={variableInputCls} value={form.trainerName} onChange={e => setForm(f => ({ ...f, trainerName: e.target.value }))}>
              {trainerNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Centro</label>
            <select className={variableInputCls} value={form.centerName} onChange={e => setForm(f => ({ ...f, centerName: e.target.value }))}>
              {centerNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Servicio</label>
            <select className={variableInputCls} value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value as FinanceServiceName }))}>
              {FINANCE_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {form.service === 'Entrenamiento grupal' && (
            <div>
              <label className={labelCls}>Días/semana</label>
              <select className={variableInputCls} value={form.groupDays} onChange={e => setForm(f => ({ ...f, groupDays: e.target.value as '1' | '2' | '3' }))}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Cantidad (sesiones)</label>
            <input type="number" min="1" step="1" className={variableInputCls} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-gray-400 hover:text-white font-medium select-none">Overrides manuales (opcional, para saltarse los parámetros fijos ese día)</summary>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelCls}>Precio manual unit. (€)</label>
              <input type="number" step="0.5" className={fixedInputCls} placeholder="Usar precio fijo" value={form.manualPrice} onChange={e => setForm(f => ({ ...f, manualPrice: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Pago entrenador manual (€)</label>
              <input type="number" step="0.5" className={fixedInputCls} placeholder="Usar pago fijo" value={form.manualTrainerPay} onChange={e => setForm(f => ({ ...f, manualTrainerPay: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Pago centro manual (€)</label>
              <input type="number" step="0.5" className={fixedInputCls} placeholder="Usar pago fijo" value={form.manualCenterPay} onChange={e => setForm(f => ({ ...f, manualCenterPay: e.target.value }))} />
            </div>
          </div>
        </details>

        <div>
          <label className={labelCls}>Notas</label>
          <input type="text" className={variableInputCls} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opcional" />
        </div>

        <button type="submit" className="flex items-center gap-2 bg-misportOrange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg">
          <Plus size={16} /> Registrar sesión
        </button>
      </form>

      <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-900/50">
          <h3 className="font-bold text-white">Sesiones registradas ({entries.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Entrenador</th>
                <th className="px-4 py-3">Centro</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3 text-right">Facturación</th>
                <th className="px-4 py-3 text-right">Pago entr.</th>
                <th className="px-4 py-3 text-right">Pago centro</th>
                <th className="px-4 py-3 text-right">Beneficio neto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(entry => {
                const t = computeTotals(entry);
                return (
                  <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-white">{entry.date}</td>
                    <td className="px-4 py-3">{entry.trainerName}</td>
                    <td className="px-4 py-3">{entry.centerName}</td>
                    <td className="px-4 py-3">{entry.service}{entry.groupDays ? ` (${entry.groupDays}d)` : ''}</td>
                    <td className="px-4 py-3 text-right">{entry.quantity}</td>
                    <td className="px-4 py-3 text-right text-white">{formatEUR(t.billingBase)}</td>
                    <td className="px-4 py-3 text-right">{formatEUR(t.trainerTotal)}</td>
                    <td className="px-4 py-3 text-right">{formatEUR(t.centerTotal)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${resultColor(t.netProfit)}`}>{formatEUR(t.netProfit)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteEntry(entry.id)} title="Eliminar" className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sortedEntries.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-600">Todavía no hay sesiones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUB-TAB: RESUMEN ---
const ResumenTab: React.FC = () => {
  const { entries, computeTotals } = useFinance();

  const rows = useMemo(() => entries.map(entry => ({ entry, totals: computeTotals(entry) })), [entries, computeTotals]);

  const kpis = useMemo(() => rows.reduce((acc, { entry, totals }) => ({
    billingBase: acc.billingBase + totals.billingBase,
    trainerTotal: acc.trainerTotal + totals.trainerTotal,
    centerTotal: acc.centerTotal + totals.centerTotal,
    margin: acc.margin + totals.margin,
    igicAmount: acc.igicAmount + totals.igicAmount,
    profitTaxAmount: acc.profitTaxAmount + totals.profitTaxAmount,
    netProfit: acc.netProfit + totals.netProfit,
    totalCharged: acc.totalCharged + totals.totalCharged,
    sessions: acc.sessions + entry.quantity,
  }), { billingBase: 0, trainerTotal: 0, centerTotal: 0, margin: 0, igicAmount: 0, profitTaxAmount: 0, netProfit: 0, totalCharged: 0, sessions: 0 }),
    [rows]);

  const byMonth = useMemo(() => groupSum(rows, e => e.date ? e.date.slice(0, 7) : 'Sin fecha').sort((a, b) => a.key.localeCompare(b.key)), [rows]);
  const byTrainer = useMemo(() => groupSum(rows, e => e.trainerName).sort((a, b) => b.billingBase - a.billingBase), [rows]);
  const byCenter = useMemo(() => groupSum(rows, e => e.centerName).sort((a, b) => b.billingBase - a.billingBase), [rows]);
  const byService = useMemo(() => groupSum(rows, e => e.service).sort((a, b) => b.billingBase - a.billingBase), [rows]);

  const kpiCards = [
    { label: 'Facturación base total', value: formatEUR(kpis.billingBase) },
    { label: 'Pago total entrenadores', value: formatEUR(kpis.trainerTotal) },
    { label: 'Pago total centros', value: formatEUR(kpis.centerTotal) },
    { label: 'Margen empresa antes IS', value: formatEUR(kpis.margin), signed: kpis.margin },
    { label: 'IGIC a abonar', value: formatEUR(kpis.igicAmount) },
    { label: 'Impuesto beneficio', value: formatEUR(kpis.profitTaxAmount) },
    { label: 'Beneficio neto empresa', value: formatEUR(kpis.netProfit), signed: kpis.netProfit, final: true },
    { label: 'Cobro total cliente c/IGIC', value: formatEUR(kpis.totalCharged) },
    { label: 'Sesiones / unidades', value: String(kpis.sessions) },
  ];

  const BreakdownTable: React.FC<{ title: string; data: Agg[]; keyLabel: string }> = ({ title, data, keyLabel }) => (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-gray-900/30">
            <tr>
              <th className="px-4 py-2.5">{keyLabel}</th>
              <th className="px-4 py-2.5 text-right">Facturación base</th>
              <th className="px-4 py-2.5 text-right">Beneficio neto</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.key} className="border-b border-gray-800 last:border-0">
                <td className="px-4 py-2.5 text-white">{row.key}</td>
                <td className="px-4 py-2.5 text-right">{formatEUR(row.billingBase)}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${resultColor(row.netProfit)}`}>{formatEUR(row.netProfit)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-600">Sin datos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <ColorLegend items={[
        { swatch: 'bg-green-500', label: 'Resultado positivo' },
        { swatch: 'bg-red-500', label: 'Resultado negativo' },
      ]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(k => {
          const isPositive = (k.signed ?? 0) >= 0;
          const finalBg = k.final ? (isPositive ? 'bg-green-900/25 border-green-600/60' : 'bg-red-900/25 border-red-600/60') : 'bg-misportDark border-gray-800';
          const valueColor = k.signed !== undefined ? resultColor(k.signed) : 'text-white';
          return (
            <div key={k.label} className={`p-5 rounded-xl border ${finalBg} ${k.final ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{k.label}</p>
              <p className={`font-bold mt-2 ${valueColor} ${k.final ? 'text-4xl' : 'text-2xl'}`}>{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownTable title="Por mes" data={byMonth} keyLabel="Mes" />
        <BreakdownTable title="Por entrenador" data={byTrainer} keyLabel="Entrenador" />
        <BreakdownTable title="Por centro" data={byCenter} keyLabel="Centro" />
        <BreakdownTable title="Por servicio" data={byService} keyLabel="Servicio" />
      </div>
    </div>
  );
};

// --- MAIN PANEL ---
export const FinancePanel: React.FC = () => {
  const [tab, setTab] = useState<'resumen' | 'registro' | 'parametros'>('resumen');

  const tabs: { id: typeof tab; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: 'Resumen', icon: Euro },
    { id: 'registro', label: 'Registrar sesión', icon: Plus },
    { id: 'parametros', label: 'Parámetros', icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'text-misportBlue' : 'text-gray-500 hover:text-gray-300'}`}>
            <t.icon size={16} /> {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-misportBlue shadow-[0_0_10px_rgba(0,123,255,0.5)]"></div>}
          </button>
        ))}
      </div>

      {tab === 'resumen' && <ResumenTab />}
      {tab === 'registro' && <RegistroTab />}
      {tab === 'parametros' && <ParametrosTab />}
    </div>
  );
};
