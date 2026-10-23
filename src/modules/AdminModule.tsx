import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Percent,
  Plus,
  Search,
  ShoppingCart,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useDataStore } from '../services/dataStore';
import { Product, PurchaseOrder } from '../types';

interface AdminModuleProps {
  activeSubTab: string;
}

export const AdminModule: React.FC<AdminModuleProps> = ({ activeSubTab }) => {
  const store = useDataStore();
  const products = store.getProducts();
  const sales = store.getSales();
  const appointments = store.getAppointments();
  const prescriptions = store.getPrescriptions();
  const consultations = store.getConsultations();
  const auditLogs = store.getAuditLogs();
  const purchaseOrders = store.getPurchaseOrders();

  // Search & Filters for Inventory
  const [invSearch, setInvSearch] = useState('');
  const [expiryFilter, setExpiryFilter] = useState<'todos' | '30' | '60' | '90'>('todos');

  // New Purchase Order modal state
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('Distribuidora Fármacos Nacionales (NADRO)');

  // 360° Business Metrics Computations
  const totalPharmacyRevenue = useMemo(() => {
    return sales.reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  const totalCost = useMemo(() => {
    return sales.reduce((acc, s) => {
      return (
        acc +
        s.items.reduce((itemAcc, item) => {
          return itemAcc + item.producto.precioCosto * item.cantidad;
        }, 0)
      );
    }, 0);
  }, [sales]);

  const grossProfit = totalPharmacyRevenue - totalCost;
  const grossMarginPct =
    totalPharmacyRevenue > 0 ? ((grossProfit / totalPharmacyRevenue) * 100).toFixed(1) : '38.5';

  // Conversion rate: Prescriptions issued vs Prescriptions redeemed in pharmacy
  const conversionRate = useMemo(() => {
    if (prescriptions.length === 0) return 85.0; // Benchmark fallback
    const redeemed = prescriptions.filter((p) => p.estado === 'surtida_total').length;
    return Math.round((redeemed / prescriptions.length) * 100);
  }, [prescriptions]);

  // Expiration Traffic Light (Semáforo de Caducidades)
  // 30 days: < 30 days, 60 days: < 60 days, 90 days: < 90 days
  const today = new Date('2026-10-23');

  const getDaysToExpiry = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const inventoryWithExpiryAlerts = useMemo(() => {
    return products.map((p) => {
      const days = getDaysToExpiry(p.fechaCaducidad);
      let risk: 'normal' | 'amarillo' | 'rojo' = 'normal';
      if (days <= 30) risk = 'rojo';
      else if (days <= 90) risk = 'amarillo';

      const isLowStock = p.stock <= p.stockMinimo;

      return {
        ...p,
        daysToExpiry: days,
        expiryRisk: risk,
        isLowStock
      };
    });
  }, [products]);

  const filteredInventory = useMemo(() => {
    return inventoryWithExpiryAlerts.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(invSearch.toLowerCase()) ||
        p.sustanciaActiva.toLowerCase().includes(invSearch.toLowerCase()) ||
        p.lote.toLowerCase().includes(invSearch.toLowerCase());

      if (expiryFilter === '30') return matchSearch && p.daysToExpiry <= 30;
      if (expiryFilter === '60') return matchSearch && p.daysToExpiry <= 60;
      if (expiryFilter === '90') return matchSearch && p.daysToExpiry <= 90;
      return matchSearch;
    });
  }, [inventoryWithExpiryAlerts, invSearch, expiryFilter]);

  // Suggested Reorder Products (Stock below minimum)
  const suggestedReorders = useMemo(() => {
    return products.filter((p) => p.stock <= p.stockMinimo);
  }, [products]);

  // Handle Automatic Purchase Order generation
  const handleGenerateAutoPO = () => {
    if (suggestedReorders.length === 0) {
      alert('Actualmente no hay productos por debajo del stock mínimo.');
      return;
    }

    const newPO: PurchaseOrder = {
      id: 'OC-' + Math.floor(10000 + Math.random() * 90000),
      proveedor: selectedSupplier,
      fecha: new Date().toLocaleString('es-MX'),
      estado: 'aprobada',
      items: suggestedReorders.map((p) => ({
        productoId: p.id,
        nombre: p.nombre,
        cantidad: Math.max(10, p.stockMinimo * 2 - p.stock),
        costoUnitario: p.precioCosto
      })),
      total: suggestedReorders.reduce((acc, p) => {
        const qty = Math.max(10, p.stockMinimo * 2 - p.stock);
        return acc + qty * p.precioCosto;
      }, 0)
    };

    store.createPurchaseOrder(newPO);
    alert(`¡Orden de Compra ${newPO.id} generada y enviada al proveedor ${selectedSupplier}!`);
    setShowPOModal(false);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* EXECUTIVE SUMMARY BAR */}
      <div className="bg-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Panel de Dirección General & Auditoría
          </span>
          <h2 className="text-2xl font-black mt-1">Pedro Mendoza — Propietario</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Farmacia & Consultorios Médicos • Matriz Sucursal Centro
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Ventas en Farmacia
            </span>
            <div className="text-lg font-black font-mono text-emerald-400">
              ${totalPharmacyRevenue.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Conversión Consultorio → POS
            </span>
            <div className="text-lg font-black font-mono text-cyan-400">
              {conversionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB: RESUMEN Y MÉTRICAS 360° */}
      {(activeSubTab === 'resumen' || !activeSubTab) && (
        <div className="space-y-6">
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Margen Bruto</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </span>
              <div className="text-2xl font-black text-slate-900">{grossMarginPct}%</div>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                +${grossProfit.toFixed(2)} utilidad calculada
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Pacientes Atendidos</span>
                <Users className="w-4 h-4 text-teal-600" />
              </span>
              <div className="text-2xl font-black text-slate-900">
                {appointments.filter((a) => a.estado === 'atendido').length}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Dra. Elena Ramos (Consultorio 1)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Alertas Caducidad</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </span>
              <div className="text-2xl font-black text-amber-600">
                {inventoryWithExpiryAlerts.filter((p) => p.expiryRisk !== 'normal').length}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Próximos a vencer en &lt; 90 días
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Sugeridos Reorden</span>
                <ShoppingCart className="w-4 h-4 text-rose-600" />
              </span>
              <div className="text-2xl font-black text-rose-600">
                {suggestedReorders.length}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Bajo nivel de stock mínimo
              </span>
            </div>
          </div>

          {/* DUAL REPORT: PHARMACY BESTSELLERS & CLINIC CIE-10 TOP DIAGNOSTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pharmacy Top Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Medicamentos con Mayor Rotación y Margen</span>
                </h4>
                <span className="text-xs text-slate-400">Farmacia POS</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {products.slice(0, 5).map((prod) => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{prod.nombre}</div>
                      <span className="text-slate-400 text-[11px]">
                        {prod.presentacion} • Costo: ${prod.precioCosto.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        ${prod.precioVenta.toFixed(2)}
                      </div>
                      <span className="text-emerald-700 font-semibold text-[10px]">
                        Margen: {Math.round(((prod.precioVenta - prod.precioCosto) / prod.precioVenta) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinic Top Diagnostics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Diagnósticos CIE-10 Más Frecuentes en Consultorio</span>
                </h4>
                <span className="text-xs text-slate-400">Consultorio 1</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { cie: 'J03.9', desc: 'Amigdalitis y faringitis aguda', pct: 38, count: 14 },
                  { cie: 'K29.1', desc: 'Gastritis aguda y reflujo', pct: 28, count: 10 },
                  { cie: 'I10', desc: 'Hipertensión arterial primaria', pct: 20, count: 7 },
                  { cie: 'M54.5', desc: 'Lumbago y contractura muscular', pct: 14, count: 5 }
                ].map((item) => (
                  <div key={item.cie} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">
                        <strong className="text-teal-700">{item.cie}</strong> - {item.desc}
                      </span>
                      <span className="text-slate-500 font-mono">{item.count} pacientes</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: INVENTARIO & SEMÁFORO DE CADUCIDADES */}
      {activeSubTab === 'inventario' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <span>Control de Inventario y Semáforo de Caducidades</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitorea fechas de vencimiento a 30, 60 y 90 días para aplicar promociones o devoluciones.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setExpiryFilter('todos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  expiryFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                onClick={() => setExpiryFilter('30')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  expiryFilter === '30'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                🔴 &lt; 30 Días ({inventoryWithExpiryAlerts.filter((p) => p.daysToExpiry <= 30).length})
              </button>
              <button
                onClick={() => setExpiryFilter('60')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  expiryFilter === '60'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                🟡 &lt; 60 Días ({inventoryWithExpiryAlerts.filter((p) => p.daysToExpiry <= 60).length})
              </button>
              <button
                onClick={() => setExpiryFilter('90')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  expiryFilter === '90'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                🔵 &lt; 90 Días ({inventoryWithExpiryAlerts.filter((p) => p.daysToExpiry <= 90).length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
              placeholder="Buscar por nombre, sustancia activa o lote..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
            />
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Medicamento / Producto</th>
                  <th className="p-3.5">Lote</th>
                  <th className="p-3.5">Caducidad</th>
                  <th className="p-3.5">Semáforo</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Precio Venta</th>
                  <th className="p-3.5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.nombre}</div>
                      <div className="text-slate-400 text-[11px]">{item.sustanciaActiva}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{item.lote}</td>
                    <td className="p-3.5 font-mono text-slate-700">{item.fechaCaducidad}</td>
                    <td className="p-3.5">
                      {item.daysToExpiry <= 30 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          CRÍTICO ({item.daysToExpiry}d)
                        </span>
                      ) : item.daysToExpiry <= 90 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          PREVENCIÓN ({item.daysToExpiry}d)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Óptimo (&gt; 90d)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span
                        className={`font-bold ${
                          item.isLowStock ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {item.stock} uds
                      </span>
                      {item.isLowStock && (
                        <span className="text-[10px] text-rose-500 block">Min: {item.stockMinimo}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      ${item.precioVenta.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {item.daysToExpiry <= 30 ? (
                        <button
                          onClick={() =>
                            alert(
                              `Promoción aplicada al producto ${item.nombre}: 20% descuento para acelerar rotación antes de vencimiento.`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600"
                        >
                          Aplicar Promo
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const newStock = prompt(
                              `Actualizar stock para ${item.nombre}:`,
                              item.stock.toString()
                            );
                            if (newStock !== null) {
                              const qty = parseInt(newStock) || 0;
                              item.stock = qty;
                              store.saveProduct(item);
                            }
                          }}
                          className="px-2 py-1 rounded text-slate-600 hover:bg-slate-200 text-[11px]"
                        >
                          Ajustar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: COMPRAS Y PROVEEDORES */}
      {activeSubTab === 'compras' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <span>Gestión de Compras y Proveedores Mayoristas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Órdenes de compra automáticas basadas en el semáforo y mínimos de stock.
              </p>
            </div>

            <button
              onClick={() => setShowPOModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Generar Orden de Reorden Automática</span>
            </button>
          </div>

          {/* Suggested Reorder Alert */}
          {suggestedReorders.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Hay {suggestedReorders.length} productos con stock por debajo del mínimo sugerido.
                </span>
              </div>
              <button
                onClick={() => setShowPOModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
              >
                Reordenar Ahora
              </button>
            </div>
          )}

          {/* Orders History */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
              Historial de Órdenes de Compra
            </div>

            {purchaseOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aún no hay órdenes de compra registradas. Genera una con el botón superior.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700">{po.id}</span>
                        <span className="font-bold text-slate-800">• {po.proveedor}</span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        Fecha: {po.fecha} • {po.items.length} productos solicitados
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ${po.total.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        {po.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PO Modal */}
          {showPOModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold text-slate-900 text-base">
                  Generar Orden de Compra Sugerida
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Distribuidora Farmacéutica:
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Distribuidora Fármacos Nacionales (NADRO)">
                        NADRO - Distribuidora Nacional
                      </option>
                      <option value="Marzam Distribución Farmacéutica">
                        Marzam Farmacéutica
                      </option>
                      <option value="Fármacos Especializados">
                        Fármacos Especializados
                      </option>
                      <option value="Laboratorios Pisa Directo">
                        Laboratorios Pisa Directo
                      </option>
                    </select>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                    <span className="font-bold text-slate-800">
                      Productos a reordenar automáticamente:
                    </span>
                    {suggestedReorders.map((p) => (
                      <div key={p.id} className="flex justify-between py-1 border-b last:border-b-0">
                        <span>{p.nombre}</span>
                        <span className="font-mono font-bold">
                          10 uds x ${p.precioCosto.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowPOModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateAutoPO}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-xs"
                  >
                    Confirmar y Emitir Orden
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: AUDITORÍA Y SEGURIDAD */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Bitácora de Auditoría y Seguridad del Sistema</span>
              </h3>
              <p className="text-xs text-slate-500">
                Registro inmutable de recetas emitidas, cancelaciones, descuentos y operaciones de caja.
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-800 px-3 py-1 rounded-xl">
              {auditLogs.length} Registros
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.accion}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">Por: {log.usuario}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">
                      {log.rol}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{log.detalle}</div>
                </div>
                <div className="text-slate-400 text-[11px] font-mono shrink-0">
                  {log.fecha}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
