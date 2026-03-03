import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { CAT_COLOR } from '../constants/categories.js';
import { fmt, pct, mColor } from '../utils/formatters.js';
import { StatCard, MarginHealth } from './StatCard.jsx';
import EmptyState from './EmptyState.jsx';

function exportAsImage(ref, filename) {
    if (!ref.current) return;
    html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

export default function DiscountPanel({
    entries, discountedProducts, updateEntry, removeEntry, filterCat, condicionVenta,
}) {
    const accent = CAT_COLOR[filterCat] || 'var(--accent)';
    const exportRef = useRef(null);

    if (discountedProducts.length === 0) {
        return <EmptyState icon="🏷️" title="Sin productos seleccionados" subtitle="Elegí productos y asignales descuentos individuales" />;
    }

    const totalSinDto = discountedProducts.reduce((s, p) => s + (p.precioLista * p.qty), 0);
    const totalConDto = discountedProducts.reduce((s, p) => s + (p.precioFinal * p.qty), 0);
    const totalCosto = discountedProducts.reduce((s, p) => s + (p.costo * p.qty), 0);
    const totalAhorro = totalSinDto - totalConDto;
    const totalGanancia = totalConDto - totalCosto;
    const totalMargen = totalConDto > 0 ? (totalGanancia / totalConDto) * 100 : 0;

    return (
        <>
            <div className="card animate-fadeInRight">
                <div className="section-label">Descuento Individual por Ítem</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Podés agregar el mismo producto varias veces para crear combos (ej. 6 unidades normales + 1 con 100% dto).
                </div>
            </div>

            <div className="card card--highlighted animate-fadeInRight" ref={exportRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Presupuesto Detallado</div>
                    <button className="btn-export" onClick={() => exportAsImage(exportRef, 'presupuesto-bertoldi.png')}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Exportar PNG
                    </button>
                </div>

                <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {discountedProducts.map(p => (
                        <div key={p.uid} style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
                                <div className="truncate" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{p.desc}</div>
                                <button onClick={() => removeEntry(p.uid)} title="Quitar" style={{
                                    flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                                    background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,.2)',
                                    color: 'var(--red)', fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>×</button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                {/* Qty Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,.15)', borderRadius: 8, padding: 2 }}>
                                    <button onClick={() => updateEntry(p.uid, { qty: Math.max(0, p.qty - 1) })} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>-</button>
                                    <input type="number" value={p.qty} onChange={ev => updateEntry(p.uid, { qty: Math.max(0, parseInt(ev.target.value) || 0) })}
                                        style={{ width: 44, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 4, color: accent, fontWeight: 800, fontSize: 13 }} />
                                    <button onClick={() => updateEntry(p.uid, { qty: p.qty + 1 })} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>+</button>
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: 'var(--font-display)' }}>{fmt(p.precioFinal)}</div>
                                    {p.descuento > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: accent, color: '#fff', padding: '1px 6px', borderRadius: 99 }}>-{p.descuento}%</span>}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase' }}>Dto %</div>
                                    <input type="number" min={0} max={100}
                                        value={p.descuento} placeholder="0"
                                        onChange={ev => updateEntry(p.uid, { discount: Math.min(100, Math.max(0, Number(ev.target.value))) })}
                                        style={{ width: 48, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                                <div style={{ textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 7, padding: '5px 4px' }}>
                                    <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lista</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(p.precioLista)}</div>
                                </div>
                                <div style={{ textAlign: 'center', background: mColor(p.margen) === 'var(--green)' ? 'var(--green-bg)' : 'var(--red-bg)', borderRadius: 7, padding: '5px 4px' }}>
                                    <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margen</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: mColor(p.margen) }}>{pct(p.margen)}</div>
                                </div>
                                <div style={{ textAlign: 'center', background: 'rgba(129,140,248,.08)', borderRadius: 7, padding: '5px 4px' }}>
                                    <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subtotal</div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(p.subtotalFinal)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divider" />

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                    <div className="price-row">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total sin descuento</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(totalSinDto)}</span>
                    </div>
                    <div className="price-final-row" style={{ borderColor: `${accent}30`, background: `${accent}10` }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Total con descuento</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: 'var(--font-display)' }}>{fmt(totalConDto)}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                        Costo total: {fmt(totalCosto)}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    <StatCard label="Tu ganancia" value={fmt(totalGanancia)} valueColor={totalGanancia >= 0 ? 'var(--green)' : 'var(--red)'} />
                    <StatCard label="Margen total" value={pct(totalMargen)} valueColor={mColor(totalMargen)} />
                </div>

                <MarginHealth margen={totalMargen} />

                {/* Total client savings */}
                {discountedProducts.some(p => p.descuento > 0) && (
                    <div style={{
                        marginTop: 12,
                        background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(52,211,153,.15))',
                        borderRadius: 12, padding: '14px 16px',
                        border: '1.5px solid rgba(52,211,153,.25)',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{ fontSize: 24, lineHeight: 1 }}>🎁</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Beneficio total para el cliente</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>{fmt(totalAhorro)}</div>
                            <div style={{ fontSize: 11, color: 'rgba(52,211,153,.7)' }}>de ahorro en esta selección</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
