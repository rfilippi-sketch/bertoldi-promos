import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { CAT_COLOR } from '../constants/categories.js';
import { fmt, pct, mColor } from '../utils/formatters.js';
import { StatCard, MarginHealth } from './StatCard.jsx';
import EmptyState from './EmptyState.jsx';
import ExportPDFTemplate from './ExportPDFTemplate.jsx';
import { exportToPDF } from '../utils/pdfExport.js';

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
    entries, bundleCalc,
    bundleDiscount, setBundleDiscount,
    hasIndivBundleDisc, sliderLocked, inputsLocked,
    resetBundleMode, addEntry, removeEntry, updateEntry, filterCat, condicionVenta, getPrecio,
    onSave
}) {
    const [accentColor, setAccentColor] = useState(CAT_COLOR[filterCat] || 'var(--accent)');
    const exportRef = useRef(null);
    const pdfTemplateRef = useRef(null);

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
                        background: !sliderLocked ? `${accentColor}15` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${!sliderLocked ? accentColor : 'var(--border)'}`,
                        opacity: sliderLocked ? 0.45 : 1,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: !sliderLocked ? accentColor : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🎚️ Dto general</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Aplica % igual a todos</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>O</div>
                    <div style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, textAlign: 'center',
                        background: sliderLocked ? `${accentColor}15` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${sliderLocked ? accentColor : 'var(--border)'}`,
                        opacity: inputsLocked ? 0.45 : 1,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: sliderLocked ? accentColor : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🏷️ Dto por producto</div>
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
                <div style={{ opacity: sliderLocked ? 0.3 : 1, pointerEvents: sliderLocked ? 'none' : 'auto', transition: 'opacity .2s', '--accent': accentColor }}>
                    <div className="section-label">Descuento general del bundle</div>
                    {sliderLocked && (
                        <div className="lock-badge" style={{ marginBottom: 10 }}>🔒 Bloqueado — hay descuentos individuales activos</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                        <span style={{ fontSize: 48, fontWeight: 800, color: sliderLocked ? 'var(--text-muted)' : accentColor, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                            {bundleDiscount}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <input type="range" min={0} max={100} value={bundleDiscount}
                        onChange={e => { if (!sliderLocked) setBundleDiscount(Number(e.target.value)); }}
                        style={{ cursor: sliderLocked ? 'not-allowed' : 'pointer', accentColor: accentColor }}
                    />
                </div>
            </div>

            {/* Results card */}
            <div className="card card--highlighted animate-fadeInRight" ref={exportRef} style={{ '--accent': accentColor }}>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Acciones de la Promo</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button onClick={() => {
                            const name = prompt("Nombre para esta promo:");
                            if (name) onSave(name, 'bundle', entries, bundleCalc);
                        }} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: 'var(--accent)', color: '#fff', border: 'none',
                            padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            💾 Guardar
                        </button>
                        <button onClick={() => exportToWhatsApp(entries.map(e => ({ ...e, precio: getPrecio(e) })), bundleCalc)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#25D366', color: '#fff', border: 'none',
                            padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.098.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.564-10.563 5.826 0 10.565 4.739 10.566 10.563 0 5.824-4.741 10.563-10.563 10.564h-.001z" />
                            </svg>
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* Header row with export button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Productos en el Bundle</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => exportToPDF(pdfTemplateRef.current, `Propuesta_Bundle_${new Date().getTime()}.pdf`)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
                            padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>
                            PDF
                        </button>
                        <button onClick={() => exportAsImage(exportRef, 'bundle.png')} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
                            padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>
                            PNG
                        </button>
                        <button onClick={() => resetBundleMode()} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--red)',
                            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        }}>
                            🗑️
                        </button>
                    </div>
                </div>

                {/* hidden PDF template */}
                <ExportPDFTemplate
                    ref={pdfTemplateRef}
                    entries={entries.map(e => ({ ...e, precio: getPrecio(e) }))}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                />

                {/* Product list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 240, overflowY: 'auto' }}>
                    {entries.map(e => {
                        const precioLista = getPrecio(e);
                        const precioConD = precioLista * (1 - e.discount / 100);
                        return (
                            <div key={e.uid} style={{
                                background: inputsLocked ? 'rgba(255,255,255,.02)' : (e.discount > 0 ? `${accentColor}12` : 'var(--bg-card)'),
                                border: `1.5px solid ${e.discount > 0 ? accentColor + '40' : 'var(--border)'}`,
                                borderRadius: 10, padding: '10px 12px',
                                opacity: inputsLocked ? 0.55 : 1,
                                transition: 'all .2s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
                                    <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                                        {e.desc}
                                    </div>
                                    <button onClick={() => removeEntry(e.uid)} title="Quitar del bundle" style={{
                                        flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                                        background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,.2)',
                                        color: 'var(--red)', fontSize: 14, fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>×</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {/* Qty Controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,.1)', borderRadius: 8, padding: 2 }}>
                                        <button onClick={() => updateEntry(e.uid, { qty: Math.max(0, e.qty - 1) })} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>-</button>
                                        <input type="number" value={e.qty} onChange={ev => updateEntry(e.uid, { qty: Math.max(0, parseInt(ev.target.value) || 0) })}
                                            style={{ width: 44, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 4, color: accentColor, fontWeight: 800, fontSize: 13 }} />
                                        <button onClick={() => updateEntry(e.uid, { qty: e.qty + 1 })} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>+</button>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: e.discount > 0 ? accentColor : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                                {fmt(precioConD)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                                            {fmt(precioConD * e.qty)}
                                        </div>
                                    </div>

                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4, marginRight: 4 }}>
                                        <span style={{ fontSize: 8, color: e.isFree ? accentColor : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', transition: 'color .2s' }}>Sin Costo</span>
                                        <input type="checkbox" checked={e.isFree || false}
                                            onChange={ev => updateEntry(e.uid, { isFree: ev.target.checked })}
                                            style={{ accentColor: accentColor, width: 16, height: 16, cursor: 'pointer', margin: 0 }}
                                        />
                                    </label>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 700, textTransform: 'uppercase' }}>Dto %</div>
                                        <input type="number" min={0} max={100}
                                            value={e.discount} placeholder="0"
                                            onChange={ev => updateEntry(e.uid, { discount: Math.min(100, Math.max(0, Number(ev.target.value))) })}
                                            style={{
                                                width: 42, padding: '4px 0', textAlign: 'center', border: '1.5px solid var(--border)',
                                                borderRadius: 6, background: 'var(--bg-card)', color: accentColor,
                                                fontWeight: 800, fontSize: 12, outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="price-final-row" style={{ borderColor: `${accentColor}30`, background: `${accentColor}10` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Precio Bundle</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: accentColor, fontFamily: 'var(--font-display)' }}>{fmt(bundleCalc.precioBundle)}</span>
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
                    marginTop: 10,
                    background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(52,211,153,.15))',
                    borderRadius: 12, padding: '14px 16px',
                    border: '1.5px solid rgba(52,211,153,.25)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>🎁</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Beneficio cliente</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{fmt(bundleCalc.ahorroTotal)}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

function exportToWhatsApp(entries, bundleCalc) {
    const separator = "--------------------------";
    let text = `Hola! Te arme esta promo exclusiva:\n\n* TU PEDIDO *\n${separator}\n`;

    entries.forEach(e => {
        const pLista = e.precio * e.qty;
        text += `- ${e.desc} (x${e.qty}) - Subtotal: $${Math.round(pLista).toLocaleString('es-AR')}\n`;
    });

    text += `${separator}\n`;

    if (bundleCalc.ahorroTotal > 0) {
        text += `\n* Ahorro Total: $${Math.round(bundleCalc.ahorroTotal).toLocaleString('es-AR')}`;
    }

    text += `\n* VALOR FINAL: $${Math.round(bundleCalc.precioBundle).toLocaleString('es-AR')}\n\n${separator}\nAvisame si te reservo el pedido!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
