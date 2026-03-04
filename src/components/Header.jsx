import { useRef } from 'react';
import { CAT_COLOR } from '../constants/categories.js';

const STATUS_CONFIG = {
    loading: { color: "var(--text-muted)", icon: "⏳", prefix: "cargando…" },
    saving: { color: "var(--yellow)", icon: "💾", prefix: "guardando…" },
    saved: { color: "var(--green)", icon: "💾", prefix: "" },
    loaded: { color: "var(--green)", icon: "📦", prefix: "" },
    seed: { color: "var(--yellow)", icon: "⚠️", prefix: "" },
    error: { color: "var(--red)", icon: "❌", prefix: "" },
};

export default function Header({
    productos, storageStatus, storageInfo,
    filterCat, importing, csvMsg, fileRef, handleCSV,
    user, onLogout, isAdmin, onOpenAdmin,
    theme, toggleTheme
}) {
    const accent = CAT_COLOR[filterCat] || "var(--accent)";
    const st = STATUS_CONFIG[storageStatus] || STATUS_CONFIG.seed;

    return (
        <header className="header-glass">
            <div style={{ maxWidth: 1440, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: theme === 'dark' ? `linear-gradient(135deg, ${accent}30, ${accent}10)` : `linear-gradient(135deg, ${accent}20, ${accent}05)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1.5px solid ${theme === 'dark' ? accent + '40' : accent + '20'}`,
                        flexShrink: 0,
                        boxShadow: `0 4px 14px ${accent}20`,
                    }}>
                        <img src="/logo.png" alt="Bertoldi" style={{ width: 28, height: 'auto', filter: theme === 'dark' ? 'invert(1)' : 'none' }} onError={(e) => { e.target.outerHTML = '🎯'; }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                            Bertoldi · Herramienta Interna
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-.02em", lineHeight: 1.2 }}>
                            Promos <span style={{ color: accent }}>Lab</span> <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>v1.1</span>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} style={{
                        width: 42, height: 42, borderRadius: 12, border: '1px solid var(--border)',
                        background: 'var(--bg-card)', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: 18, transition: 'all .2s'
                    }}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {/* SKU counter */}
                    <div style={{
                        background: `${accent}12`, border: `1px solid ${accent}30`,
                        borderRadius: 12, padding: "8px 18px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: accent, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                            {productos.length.toLocaleString("es-AR")}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 2 }}>
                            SKUs cargados
                        </div>
                        <div style={{ fontSize: 10, marginTop: 3, color: st.color, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <span>{st.icon}</span>
                            <span>{st.prefix}{storageInfo}</span>
                        </div>
                    </div>

                    {/* CSV import — ADMIN ONLY */}
                    {isAdmin && (
                        <div>
                            <input type="file" accept=".csv,.txt,.tsv" ref={fileRef} onChange={handleCSV} style={{ display: "none" }} />
                            <button className="btn-csv" onClick={() => fileRef.current?.click()} disabled={importing}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                {importing ? "Importando…" : "Importar CSV del ERP"}
                            </button>
                            {csvMsg && (
                                <div style={{ fontSize: 11, marginTop: 5, fontWeight: 500, color: csvMsg.startsWith("✅") ? "var(--green)" : "var(--red)" }}>
                                    {csvMsg}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User badge */}
                    {user && (
                        <div className="user-badge">
                            <div>
                                <div className="user-badge-name">{user.name}</div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span className={`user-badge-role ${user.role}`}>
                                        {user.role === 'admin' ? '🛡️ Admin' : '👤 Usuario'}
                                    </span>
                                    {isAdmin && (
                                        <button
                                            onClick={onOpenAdmin}
                                            style={{
                                                background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)',
                                                borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', color: '#6366f1',
                                                padding: '2px 8px', textTransform: 'uppercase'
                                            }}
                                        >
                                            Panel Admin
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button className="btn-logout" onClick={onLogout}>Salir</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
