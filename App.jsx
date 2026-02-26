import { useState, useEffect, useRef } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: "Alimentacion", icon: "🍽️", color: "#22c55e" },
  { id: "Transporte",   icon: "🚗", color: "#3b82f6" },
  { id: "Servicios",    icon: "⚡", color: "#f97316" },
  { id: "Salud",        icon: "💊", color: "#ef4444" },
  { id: "Ropa",         icon: "👕", color: "#a855f7" },
  { id: "Educacion",    icon: "📚", color: "#06b6d4" },
  { id: "Entretenimiento", icon: "🎬", color: "#eab308" },
  { id: "Otros",        icon: "📦", color: "#6b7280" },
];
const METODOS = ["Efectivo", "Transferencia", "Tarjeta Débito", "Tarjeta Crédito"];
const DIAS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getCat(id) { return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[7]; }
function getNivel(total) {
  if (total < 10) return { label: "Bajo", color: "#22c55e" };
  if (total < 50) return { label: "Medio", color: "#eab308" };
  return { label: "Alto", color: "#ef4444" };
}
function fmtMoney(n) { return `$${Number(n).toFixed(2)}`; }
function fmtDate(d) {
  const dt = new Date(d);
  return `${DIAS[dt.getDay()]}, ${dt.getDate()} ${MESES[dt.getMonth()]}`;
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const STORAGE_KEY = "gastos_v1";
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
    overflowX: "hidden",
  },
  maxW: { maxWidth: 480, margin: "0 auto", padding: "0 0 100px" },

  // header
  header: {
    padding: "24px 20px 16px",
    background: "linear-gradient(180deg, rgba(10,10,20,0.98) 0%, transparent 100%)",
    position: "sticky", top: 0, zIndex: 50,
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  appName: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent" },
  offlineBadge: { fontSize: 11, padding: "3px 10px", borderRadius: 20,
    background: "rgba(251,146,60,0.15)", color: "#fb923c",
    border: "1px solid rgba(251,146,60,0.3)" },
  onlineBadge: { fontSize: 11, padding: "3px 10px", borderRadius: 20,
    background: "rgba(34,197,94,0.15)", color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.3)" },

  // balance card
  balanceCard: {
    margin: "20px 20px 0",
    padding: "28px 24px",
    borderRadius: 24,
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
    position: "relative", overflow: "hidden",
    boxShadow: "0 20px 60px rgba(99,102,241,0.3)",
  },
  balanceDeco: {
    position: "absolute", top: -40, right: -40, width: 160, height: 160,
    borderRadius: "50%", background: "rgba(255,255,255,0.05)",
  },
  balanceDeco2: {
    position: "absolute", bottom: -60, left: -20, width: 200, height: 200,
    borderRadius: "50%", background: "rgba(255,255,255,0.03)",
  },
  balanceLabel: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: "0.5px" },
  balanceAmount: { fontSize: 44, fontWeight: 800, letterSpacing: "-2px", color: "#fff", lineHeight: 1 },
  balanceRow: { display: "flex", gap: 16, marginTop: 20 },
  balanceMini: {
    flex: 1, padding: "12px 14px", borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
  },
  balanceMiniLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  balanceMiniVal: { fontSize: 18, fontWeight: 700, color: "#fff" },

  // section
  section: { padding: "24px 20px 0" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 },

  // cat pills
  catScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4,
    scrollbarWidth: "none", WebkitOverflowScrolling: "touch" },
  catPill: (active, color) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 50, whiteSpace: "nowrap",
    cursor: "pointer", transition: "all 0.2s",
    fontSize: 13, fontWeight: 600,
    background: active ? color : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : "rgba(255,255,255,0.5)",
    border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.08)"}`,
    boxShadow: active ? `0 4px 20px ${color}55` : "none",
    transform: active ? "scale(1.04)" : "scale(1)",
  }),

  // expense card
  expCard: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 18px", borderRadius: 18, marginBottom: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(10px)",
    cursor: "pointer", transition: "all 0.2s",
    position: "relative", overflow: "hidden",
  },
  expIcon: (color) => ({
    width: 46, height: 46, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, flexShrink: 0,
    background: `${color}22`,
    border: `1px solid ${color}33`,
  }),
  expInfo: { flex: 1, minWidth: 0 },
  expDesc: { fontSize: 15, fontWeight: 600, color: "#f1f5f9",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  expMeta: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 },
  expAmount: { fontSize: 18, fontWeight: 800, flexShrink: 0 },
  expNivel: (color) => ({
    position: "absolute", top: 0, right: 0,
    width: 3, height: "100%",
    background: color, borderRadius: "0 18px 18px 0",
  }),

  // nav
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480,
    padding: "12px 24px 20px",
    background: "rgba(10,10,20,0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex", justifyContent: "space-around", alignItems: "center",
    zIndex: 100,
  },
  navBtn: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    cursor: "pointer", padding: "6px 16px", borderRadius: 14, transition: "all 0.2s",
    background: active ? "rgba(129,140,248,0.15)" : "transparent",
    border: "none", outline: "none",
  }),
  navIcon: (active) => ({ fontSize: 22, filter: active ? "none" : "grayscale(1) opacity(0.4)" }),
  navLabel: (active) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
    color: active ? "#818cf8" : "rgba(255,255,255,0.3)", textTransform: "uppercase" }),

  // FAB
  fab: {
    width: 58, height: 58, borderRadius: "50%",
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, color: "#fff",
    boxShadow: "0 8px 30px rgba(129,140,248,0.5)",
    transition: "all 0.2s", outline: "none",
    transform: "translateY(-10px)",
  },

  // modal backdrop
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)", zIndex: 200,
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  modal: {
    width: "100%", maxWidth: 480,
    background: "linear-gradient(180deg, #141420 0%, #0f0f1a 100%)",
    borderRadius: "28px 28px 0 0",
    padding: "24px 24px 40px",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    maxHeight: "92vh", overflowY: "auto",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    background: "rgba(255,255,255,0.15)",
    margin: "0 auto 24px",
  },
  modalTitle: { fontSize: 22, fontWeight: 800, marginBottom: 24,
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },

  // form fields
  label: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8, display: "block" },
  input: {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9", fontSize: 15, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  formGroup: { marginBottom: 20 },
  amountInput: {
    fontSize: 36, fontWeight: 800, textAlign: "center",
    padding: "20px", letterSpacing: "-1px",
    background: "rgba(129,140,248,0.08)",
    border: "2px solid rgba(129,140,248,0.2)",
    borderRadius: 18, color: "#818cf8",
    width: "100%", boxSizing: "border-box",
    outline: "none", fontFamily: "inherit",
  },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 },
  catGridBtn: (active, color) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "12px 8px", borderRadius: 14, cursor: "pointer",
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    border: `1.5px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
    transition: "all 0.2s", outline: "none",
  }),
  catGridIcon: { fontSize: 22 },
  catGridLabel: (active, color) => ({ fontSize: 10, fontWeight: 700,
    color: active ? color : "rgba(255,255,255,0.35)",
    textAlign: "center", letterSpacing: "0.3px" }),

  metodosRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  metodoPill: (active) => ({
    padding: "8px 14px", borderRadius: 50, cursor: "pointer",
    fontSize: 12, fontWeight: 600, transition: "all 0.2s",
    background: active ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.05)",
    color: active ? "#818cf8" : "rgba(255,255,255,0.4)",
    border: `1px solid ${active ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.08)"}`,
    outline: "none",
  }),

  btnPrimary: {
    width: "100%", padding: "16px", borderRadius: 16,
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    border: "none", color: "#fff", fontSize: 16, fontWeight: 800,
    cursor: "pointer", letterSpacing: "0.3px",
    boxShadow: "0 8px 30px rgba(129,140,248,0.4)",
    transition: "all 0.2s", outline: "none",
    fontFamily: "inherit",
  },
  btnDanger: {
    width: "100%", padding: "14px", borderRadius: 16,
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer",
    marginTop: 10, transition: "all 0.2s", outline: "none", fontFamily: "inherit",
  },

  // stats
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  statCard: (color) => ({
    padding: "18px 16px", borderRadius: 18,
    background: `linear-gradient(135deg, ${color}18, ${color}08)`,
    border: `1px solid ${color}25`,
  }),
  statLabel: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 800 },

  emptyState: {
    textAlign: "center", padding: "60px 20px",
    color: "rgba(255,255,255,0.25)",
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: 600 },
  emptySubtext: { fontSize: 13, marginTop: 6 },
};

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [gastos, setGastos] = useState(loadData);
  const [tab, setTab] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [catFilter, setCatFilter] = useState("Todos");
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [saved, setSaved] = useState(false);

  // form state
  const [form, setForm] = useState({
    descripcion: "", categoria: "Alimentacion",
    metodo: "Efectivo", total: "", notas: ""
  });

  useEffect(() => {
    saveData(gastos);
  }, [gastos]);

  useEffect(() => {
    const on = () => { setOnline(true); setPendingSync(0); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const now = new Date();
  const mesActual = now.getMonth();
  const anioActual = now.getFullYear();

  const gastosMes = gastos.filter(g => {
    const d = new Date(g.fecha);
    return d.getMonth() === mesActual && d.getFullYear() === anioActual;
  });

  const totalMes = gastosMes.reduce((s, g) => s + Number(g.total), 0);
  const totalHoy = gastos.filter(g => {
    const d = new Date(g.fecha);
    return d.toDateString() === now.toDateString();
  }).reduce((s, g) => s + Number(g.total), 0);

  function addGasto() {
    if (!form.descripcion || !form.total || isNaN(Number(form.total))) return;
    const nuevo = {
      id: genId(),
      fecha: new Date().toISOString(),
      dia: DIAS[new Date().getDay()],
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      nivel: getNivel(Number(form.total)).label,
      metodo: form.metodo,
      total: Number(form.total),
      notas: form.notas,
      synced: online,
    };
    setGastos(prev => [nuevo, ...prev]);
    if (!online) setPendingSync(p => p + 1);
    setForm({ descripcion: "", categoria: "Alimentacion", metodo: "Efectivo", total: "", notas: "" });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1000);
  }

  function deleteGasto(id) {
    setGastos(prev => prev.filter(g => g.id !== id));
    setShowDetail(null);
  }

  // filtered list
  const filtered = (catFilter === "Todos" ? gastos : gastos.filter(g => g.categoria === catFilter))
    .slice(0, 80);

  // stats by cat for this month
  const statsByCat = CATEGORIAS.map(cat => ({
    ...cat,
    total: gastosMes.filter(g => g.categoria === cat.id).reduce((s, g) => s + Number(g.total), 0),
    count: gastosMes.filter(g => g.categoria === cat.id).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .exp-card:hover { background: rgba(255,255,255,0.07) !important; transform: translateX(2px); }
        .fab:hover { transform: translateY(-10px) scale(1.08) !important; }
        .btn-primary:hover { transform: scale(1.01); box-shadow: 0 12px 40px rgba(129,140,248,0.6) !important; }
        .saved-toast {
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          background: rgba(34,197,94,0.9); color: #fff; padding: 10px 24px;
          border-radius: 50px; font-weight: 700; font-size: 14px; z-index: 999;
          animation: fadeIn 0.2s ease;
        }
      `}</style>

      {saved && <div className="saved-toast">✓ Gasto guardado</div>}

      {/* HEADER */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <span style={S.appName}>💸 MisGastos</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {pendingSync > 0 && (
              <span style={{ fontSize: 11, color: "#fb923c" }}>{pendingSync} pendiente{pendingSync > 1 ? "s" : ""}</span>
            )}
            <span style={online ? S.onlineBadge : S.offlineBadge}>
              {online ? "● En línea" : "○ Sin red"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={S.maxW}>

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Balance Card */}
            <div style={S.balanceCard}>
              <div style={S.balanceDeco} />
              <div style={S.balanceDeco2} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={S.balanceLabel}>GASTO TOTAL — {MESES[mesActual].toUpperCase()}</div>
                <div style={S.balanceAmount}>{fmtMoney(totalMes)}</div>
                <div style={S.balanceRow}>
                  <div style={S.balanceMini}>
                    <div style={S.balanceMiniLabel}>HOY</div>
                    <div style={S.balanceMiniVal}>{fmtMoney(totalHoy)}</div>
                  </div>
                  <div style={S.balanceMini}>
                    <div style={S.balanceMiniLabel}>REGISTROS</div>
                    <div style={S.balanceMiniVal}>{gastosMes.length}</div>
                  </div>
                  <div style={S.balanceMini}>
                    <div style={S.balanceMiniLabel}>PROMEDIO</div>
                    <div style={S.balanceMiniVal}>
                      {gastosMes.length > 0 ? fmtMoney(totalMes / gastosMes.length) : "$0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Filtrar por categoría</div>
              <div style={S.catScroll}>
                <button
                  style={S.catPill(catFilter === "Todos", "#818cf8")}
                  onClick={() => setCatFilter("Todos")}
                >
                  <span>✦</span> Todos
                </button>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    style={S.catPill(catFilter === cat.id, cat.color)}
                    onClick={() => setCatFilter(cat.id)}
                  >
                    <span>{cat.icon}</span> {cat.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense List */}
            <div style={{ ...S.section, marginTop: 20 }}>
              <div style={S.sectionTitle}>
                {catFilter === "Todos" ? "Todos los gastos" : catFilter} · {filtered.length}
              </div>
              {filtered.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>🧾</div>
                  <div style={S.emptyText}>Sin gastos aún</div>
                  <div style={S.emptySubtext}>Toca + para agregar tu primer gasto</div>
                </div>
              ) : (
                filtered.map((g, i) => {
                  const cat = getCat(g.categoria);
                  const nivel = getNivel(g.total);
                  return (
                    <div
                      key={g.id}
                      className="exp-card"
                      style={{ ...S.expCard, animationDelay: `${i * 40}ms`, animation: "fadeIn 0.3s ease both" }}
                      onClick={() => setShowDetail(g)}
                    >
                      <div style={S.expNivel(nivel.color)} />
                      <div style={S.expIcon(cat.color)}>{cat.icon}</div>
                      <div style={S.expInfo}>
                        <div style={S.expDesc}>{g.descripcion}</div>
                        <div style={S.expMeta}>
                          {g.categoria} · {fmtDate(g.fecha)} · {g.metodo}
                          {!g.synced && " · 🔄"}
                        </div>
                      </div>
                      <div style={{ ...S.expAmount, color: cat.color }}>{fmtMoney(g.total)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ ...S.balanceCard, margin: "20px 20px 0" }}>
              <div style={S.balanceDeco} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={S.balanceLabel}>RESUMEN — {MESES[mesActual].toUpperCase()} {anioActual}</div>
                <div style={S.balanceAmount}>{fmtMoney(totalMes)}</div>
              </div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Por categoría</div>
              {statsByCat.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>📊</div>
                  <div style={S.emptyText}>Sin datos este mes</div>
                </div>
              ) : statsByCat.map((cat) => {
                const pct = totalMes > 0 ? (cat.total / totalMes * 100) : 0;
                return (
                  <div key={cat.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{cat.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{cat.id}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{cat.count} gasto{cat.count !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: cat.color }}>{fmtMoney(cat.total)}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                        width: `${pct}%`, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Distribución por método</div>
              <div style={S.statsGrid}>
                {METODOS.map((m, i) => {
                  const total = gastosMes.filter(g => g.metodo === m).reduce((s, g) => s + Number(g.total), 0);
                  const colors = ["#818cf8", "#22c55e", "#06b6d4", "#f97316"];
                  return total > 0 ? (
                    <div key={m} style={S.statCard(colors[i % colors.length])}>
                      <div style={S.statLabel}>{m}</div>
                      <div style={{ ...S.statValue, color: colors[i % colors.length] }}>{fmtMoney(total)}</div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Resumen historial */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Historial mensual</div>
              {Array.from({ length: 6 }, (_, i) => {
                const d = new Date(anioActual, mesActual - i, 1);
                const m = d.getMonth(), y = d.getFullYear();
                const total = gastos.filter(g => {
                  const gd = new Date(g.fecha);
                  return gd.getMonth() === m && gd.getFullYear() === y;
                }).reduce((s, g) => s + Number(g.total), 0);
                return total > 0 ? (
                  <div key={i} style={{ ...S.expCard, marginBottom: 10 }}>
                    <div style={{ ...S.expIcon("#818cf8") }}>📅</div>
                    <div style={S.expInfo}>
                      <div style={S.expDesc}>{MESES[m]} {y}</div>
                      <div style={S.expMeta}>{gastos.filter(g => { const gd = new Date(g.fecha); return gd.getMonth() === m && gd.getFullYear() === y; }).length} registros</div>
                    </div>
                    <div style={{ ...S.expAmount, color: "#818cf8" }}>{fmtMoney(total)}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={S.nav}>
        <button style={S.navBtn(tab === "home")} onClick={() => setTab("home")}>
          <span style={S.navIcon(tab === "home")}>🏠</span>
          <span style={S.navLabel(tab === "home")}>Inicio</span>
        </button>

        <button className="fab" style={S.fab} onClick={() => setShowForm(true)}>
          ＋
        </button>

        <button style={S.navBtn(tab === "stats")} onClick={() => setTab("stats")}>
          <span style={S.navIcon(tab === "stats")}>📊</span>
          <span style={S.navLabel(tab === "stats")}>Estadísticas</span>
        </button>
      </div>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div style={S.backdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={S.modal}>
            <div style={S.modalHandle} />
            <div style={S.modalTitle}>Nuevo Gasto</div>

            {/* Amount */}
            <div style={S.formGroup}>
              <input
                style={S.amountInput}
                type="number"
                placeholder="0.00"
                value={form.total}
                onChange={e => setForm(p => ({ ...p, total: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Descripcion */}
            <div style={S.formGroup}>
              <label style={S.label}>Descripción</label>
              <input
                style={S.input}
                placeholder="¿En qué gastaste?"
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              />
            </div>

            {/* Categoria */}
            <div style={S.formGroup}>
              <label style={S.label}>Categoría</label>
              <div style={S.catGrid}>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    style={S.catGridBtn(form.categoria === cat.id, cat.color)}
                    onClick={() => setForm(p => ({ ...p, categoria: cat.id }))}
                  >
                    <span style={S.catGridIcon}>{cat.icon}</span>
                    <span style={S.catGridLabel(form.categoria === cat.id, cat.color)}>{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metodo */}
            <div style={S.formGroup}>
              <label style={S.label}>Método de pago</label>
              <div style={S.metodosRow}>
                {METODOS.map(m => (
                  <button
                    key={m}
                    style={S.metodoPill(form.metodo === m)}
                    onClick={() => setForm(p => ({ ...p, metodo: m }))}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div style={S.formGroup}>
              <label style={S.label}>Notas (opcional)</label>
              <input
                style={S.input}
                placeholder="Detalles adicionales..."
                value={form.notas}
                onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              />
            </div>

            <button
              className="btn-primary"
              style={S.btnPrimary}
              onClick={addGasto}
            >
              Guardar Gasto {form.total ? `· ${fmtMoney(Number(form.total) || 0)}` : ""}
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {showDetail && (
        <div style={S.backdrop} onClick={(e) => e.target === e.currentTarget && setShowDetail(null)}>
          <div style={S.modal}>
            <div style={S.modalHandle} />
            {(() => {
              const g = showDetail;
              const cat = getCat(g.categoria);
              const nivel = getNivel(g.total);
              return (
                <>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ fontSize: 56, marginBottom: 10 }}>{cat.icon}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: cat.color, letterSpacing: "-1px" }}>
                      {fmtMoney(g.total)}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginTop: 8 }}>{g.descripcion}</div>
                  </div>

                  {[
                    ["📁 Categoría", g.categoria],
                    ["📅 Fecha", fmtDate(g.fecha)],
                    ["📆 Día", g.dia],
                    ["💳 Método", g.metodo],
                    ["⚡ Nivel", g.nivel],
                    g.notas && ["📝 Notas", g.notas],
                    ["🔄 Sincronizado", g.synced ? "Sí ✓" : "Pendiente"],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{val}</span>
                    </div>
                  ))}

                  <button style={S.btnDanger} onClick={() => deleteGasto(g.id)}>
                    🗑️ Eliminar este gasto
                  </button>
                  <button
                    style={{ ...S.btnDanger, color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)", marginTop: 8 }}
                    onClick={() => setShowDetail(null)}
                  >
                    Cerrar
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
