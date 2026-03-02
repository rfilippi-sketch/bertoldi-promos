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
    discountedProducts, toggleSelect, filterCat, condicionVenta,
}) {
    const accent = CAT_COLOR[filterCat] || 'var(--accent)';
    const exportRef = useRef(null);

    if (discountedProducts.length === 0) {
        return <EmptyState icon="🏷️" title="Sin productos seleccionados" subtitle="Elegí productos y asignales descuentos individuales" />;
    }

    const totalSinDto = discountedProducts.reduce((s, p) => s + p.precioLista, 0);
    const totalConDto = discountedProducts.reduce((s, p) => s + p.precioFinal, 0);
    const totalCosto = discountedProducts.reduce((s, p) => s + p.costo, 0);
    const totalAhorro = discountedProducts.reduce((s, p) => s + p.ahorro, 0);
    const totalGanancia = totalConDto - totalCosto;
    const totalMargen = totalConDto > 0 ? (totalGanancia / totalConDto) * 100 : 0;

    return (
        <>
            <div className="card animate-fadeInRight">
                <div className="section-label">Descuento por Producto</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Seleccioná productos de la lista e ingresá el % de descuento en cada fila.
                    {condicionVenta > 0 && (
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}> La condición de venta ({condicionVenta}%) ya está aplicada.</span>
                    )}
                </div>
            </div>

            <div className="card card--highlighted animate-fadeInRight" ref={exportRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Resumen por Producto</div>
                    <button className="btn-export" onClick={() => exportAsImage(exportRef, 'descuentos-bertoldi.png')}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Exportar PNG
                    </button>
                </div>

                <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {discountedProducts.map(p => (
                        <div key={p.id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, gap: 6 }}>
                                <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{p.desc}</div>
                                <button onClick={() => toggleSelect(p.id)} title="Quitar producto" style={{
                                    flexShrink: 0, width: 20, height: 20, borderRadius: 5,
                                    background: 'var(--red-bg)', border: '1.5px solid rgba(248,113,113,.3)',
                                    color: 'var(--red)', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    lineHeight: 1, transition: 'all .15s',
                                }}>×</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 5 }}>
                                <div style={{ textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 7, padding: '7px 4px' }}>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Lista</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: p.descuento > 0 ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: p.descuento > 0 ? 'line-through' : 'none' }}>{fmt(p.precioLista)}</div>
                                </div>
                                <div style={{ textAlign: 'center', background: `${accent}12`, borderRadius: 7, padding: '7px 4px', border: `1px solid ${accent}30` }}>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: accent, textTransform: 'uppercase', marginBottom: 3 }}>Con Dto.</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{fmt(p.precioFinal)}</div>
                                </div>
                                <div style={{ textAlign: 'center', background: mColor(p.margen) === 'var(--green)' ? 'var(--green-bg)' : mColor(p.margen) === 'var(--yellow)' ? 'var(--yellow-bg)' : 'var(--red-bg)', borderRadius: 7, padding: '7px 4px' }}>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Margen</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: mColor(p.margen) }}>{pct(p.margen)}</div>
                                </div>
                                <div style={{ textAlign: 'center', background: 'rgba(129,140,248,.08)', borderRadius: 7, padding: '7px 4px' }}>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Markup</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{pct(p.markup)}</div>
                                </div>
                            </div>
                            {p.descuento > 0 && (
                                <div style={{ marginTop: 6, background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 6, padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500 }}>🎁 Cliente ahorra</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>{fmt(p.ahorro)}</span>
                                </div>
                            )}
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
