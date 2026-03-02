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

export default function BundlePanel({
    selectedProducts, bundleCalc,
    bundleDiscount, setBundleDiscount,
    bundleProductDiscounts, setBundleProductDiscounts,
    hasIndivBundleDisc, sliderLocked, inputsLocked,
    resetBundleMode, toggleSelect,
    filterCat, condicionVenta, getPrecio,
}) {
    const accent = CAT_COLOR[filterCat] || 'var(--accent)';
    const exportRef = useRef(null);

    if (!bundleCalc) {
        return <EmptyState icon="📦" title="Sin productos seleccionados" subtitle="Elegí 2 o más productos para calcular el bundle" />;
    }

    return (
        <>
            {/* Discount mode card */}
            <div className="card animate-fadeInRight">
                <div style={{ display: 'flex', gap: 8, marginBottom: bundleDiscount > 0 || hasIndivBundleDisc ? 12 : 18 }}>
                    <div style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, textAlign: 'center',
                        background: !sliderLocked ? `${accent}15` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${!sliderLocked ? accent : 'var(--border)'}`,
                        opacity: sliderLocked ? 0.45 : 1,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: !sliderLocked ? accent : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🎚️ Dto general</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Aplica % igual a todos</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>O</div>
                    <div style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, textAlign: 'center',
                        background: sliderLocked ? `${accent}15` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${sliderLocked ? accent : 'var(--border)'}`,
                        opacity: inputsLocked ? 0.45 : 1,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: sliderLocked ? accent : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🏷️ Dto por producto</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>% diferente por ítem</div>
                    </div>
                </div>

                {(hasIndivBundleDisc || bundleDiscount > 0) && (
                    <div style={{ textAlign: 'right', marginBottom: 12 }}>
                        <button onClick={resetBundleMode} style={{
                            fontSize: 11, color: 'var(--text-muted)', background: 'none',
                            border: 'none', cursor: 'pointer', textDecoration: 'underline',
                        }}>Reiniciar descuentos</button>
                    </div>
                )}

                {/* Global slider */}
                <div style={{ opacity: sliderLocked ? 0.3 : 1, pointerEvents: sliderLocked ? 'none' : 'auto', transition: 'opacity .2s', '--accent': accent }}>
                    <div className="section-label">Descuento general del bundle</div>
                    {sliderLocked && (
                        <div className="lock-badge" style={{ marginBottom: 10 }}>🔒 Bloqueado — hay descuentos individuales activos</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                        <span style={{ fontSize: 48, fontWeight: 800, color: sliderLocked ? 'var(--text-muted)' : accent, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                            {bundleDiscount}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <input type="range" min={0} max={100} value={bundleDiscount}
                        onChange={e => { if (!sliderLocked) setBundleDiscount(Number(e.target.value)); }}
                        style={{ cursor: sliderLocked ? 'not-allowed' : 'pointer', accentColor: accent }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 5, fontWeight: 500 }}>
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                </div>
            </div>

            {/* Results card */}
            <div className="card card--highlighted animate-fadeInRight" ref={exportRef} style={{ '--accent': accent }}>
                {/* Header row with export button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Productos en el Bundle</div>
                    <button className="btn-export" onClick={() => exportAsImage(exportRef, 'bundle-bertoldi.png')}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Exportar PNG
                    </button>
                </div>

                {/* Product list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
                    {selectedProducts.map(p => {
                        const indivD = bundleProductDiscounts[p.id] ?? 0;
                        const precioLista = getPrecio(p);
                        const precioConD = precioLista * (1 - indivD / 100);
                        return (
                            <div key={p.id} style={{
                                background: inputsLocked ? 'rgba(255,255,255,.02)' : (indivD > 0 ? `${accent}12` : 'var(--bg-surface)'),
                                border: `1.5px solid ${indivD > 0 ? accent + '40' : 'var(--border)'}`,
                                borderRadius: 10, padding: '10px 12px',
                                opacity: inputsLocked ? 0.55 : 1,
                                transition: 'all .2s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
                                    <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                                        {p.desc}
                                    </div>
                                    <button onClick={() => toggleSelect(p.id)} title="Quitar del bundle" style={{
                                        flexShrink: 0, width: 20, height: 20, borderRadius: 5,
                                        background: 'var(--red-bg)', border: '1.5px solid rgba(248,113,113,.3)',
                                        color: 'var(--red)', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        lineHeight: 1, transition: 'all .15s',
                                    }}>×</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {indivD > 0 && (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(precioLista)}</span>
                                            )}
                                            <span style={{ fontSize: 14, fontWeight: 800, color: indivD > 0 ? accent : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                                {fmt(precioConD)}
                                            </span>
                                            {indivD > 0 && (
                                                <span style={{ fontSize: 11, fontWeight: 700, background: accent, color: '#fff', padding: '1px 7px', borderRadius: 99 }}>
                                                    -{indivD}%
                                                </span>
                                            )}
                                        </div>
                                        {indivD > 0 && (
                                            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500, marginTop: 2 }}>
                                                Ahorra {fmt(precioLista - precioConD)}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', pointerEvents: inputsLocked ? 'none' : 'auto' }}>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase' }}>Dto %</div>
                                        <input type="number" min={0} max={100} step={1}
                                            value={indivD} placeholder="0"
                                            onChange={e => {
                                                if (inputsLocked) return;
                                                const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                                setBundleProductDiscounts(prev => ({ ...prev, [p.id]: val }));
                                            }}
                                            style={{ width: 60, opacity: inputsLocked ? 0.4 : 1, cursor: inputsLocked ? 'not-allowed' : 'auto' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {inputsLocked && (
                    <div className="lock-badge" style={{ marginBottom: 12 }}>
                        🔒 Descuentos individuales bloqueados — usá el slider o reiniciá
                    </div>
                )}

                <div className="divider" />

                {/* Condición de venta breakdown */}
                {condicionVenta > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                        <div className="price-row">
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Precio lista</span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{fmt(bundleCalc.precioNormal)}</span>
                        </div>
                        <div className="price-row">
                            <span style={{ fontSize: 13, color: 'var(--green)' }}>Cond. de venta ({condicionVenta}%)</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>− {fmt(bundleCalc.ahorroCondicion)}</span>
                        </div>
                        <div className="price-row">
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Precio c/ condición</span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmt(bundleCalc.precioPosCondicion)}</span>
                        </div>
                        {bundleCalc.ahorroPromo > 0 && (
                            <div className="price-row">
                                <span style={{ fontSize: 13, color: accent }}>Descuento promo</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>− {fmt(bundleCalc.ahorroPromo)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Price breakdown */}
                {condicionVenta === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
                        <div className="price-row">
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Precio normal</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(bundleCalc.precioNormal)}</span>
                        </div>
                        <div className="price-row">
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {hasIndivBundleDisc ? 'Descuentos individuales' : `Descuento promo (${bundleDiscount}%)`}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>− {fmt(bundleCalc.ahorro)}</span>
                        </div>
                    </div>
                )}

                <div className="price-final-row" style={{ borderColor: `${accent}30`, background: `${accent}10` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Precio Bundle</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: 'var(--font-display)' }}>{fmt(bundleCalc.precioBundle)}</span>
                </div>

                <div className="divider" />

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    <StatCard label="Tu costo" value={fmt(bundleCalc.costoTotal)} valueColor="var(--text-secondary)" />
                    <StatCard label="Tu ganancia" value={fmt(bundleCalc.ganancia)} valueColor={bundleCalc.ganancia >= 0 ? 'var(--green)' : 'var(--red)'} />
                    <StatCard label="Margen" value={pct(bundleCalc.margen)} valueColor={mColor(bundleCalc.margen)} sub="ganancia / precio venta" />
                    <StatCard label="Markup" value={pct(bundleCalc.markup)} valueColor="var(--accent)" sub="ganancia / costo" />
                </div>

                {/* Margin health */}
                <MarginHealth margen={bundleCalc.margen} />

                {/* Client savings */}
                <div style={{
                    marginTop: 12,
                    background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(52,211,153,.15))',
                    borderRadius: 12, padding: '14px 16px',
                    border: '1.5px solid rgba(52,211,153,.25)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>🎁</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Beneficio para el cliente</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{fmt(bundleCalc.ahorro)}</div>
                        <div style={{ fontSize: 11, color: 'rgba(52,211,153,.7)', marginTop: 2 }}>de ahorro comprando el combo</div>
                    </div>
                    {!hasIndivBundleDisc && bundleDiscount > 0 && (
                        <div style={{ textAlign: 'center', background: 'rgba(52,211,153,.15)', borderRadius: 8, padding: '6px 10px', border: '1px solid rgba(52,211,153,.3)' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>{bundleDiscount}%</div>
                            <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600 }}>OFF</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
