import { useRef } from 'react';
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

export default function DiscountPanel({
    entries, discountedProducts, updateEntry, removeEntry, filterCat, condicionVenta,
    onSave
}) {
    const accent = CAT_COLOR[filterCat] || 'var(--accent)';
    const exportRef = useRef(null);
    const pdfTemplateRef = useRef(null);

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
                    Podés agregar el mismo producto varias veces para crear combos.
                </div>
            </div>

            <div className="card card--highlighted animate-fadeInRight" ref={exportRef}>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Acciones del Presupuesto</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button onClick={() => {
                            const name = prompt("Nombre para este presupuesto:");
                            if (name) onSave(name, 'individual', entries, { totalConDto, totalAhorro });
                        }} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: accent, color: '#fff', border: 'none',
                            padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            💾 Guardar
                        </button>
                        <button onClick={() => exportToWhatsApp(discountedProducts, totalConDto, totalAhorro)} style={{
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Presupuesto Detallado</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => exportToPDF(pdfTemplateRef.current, `Propuesta_Bertoldi_${new Date().getTime()}.pdf`)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
                            padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>
                            PDF
                        </button>
                        <button className="btn-export" onClick={() => exportAsImage(exportRef, 'presupuesto-bertoldi.png')} style={{ fontSize: 11, padding: '6px 10px' }}>
                            PNG
                        </button>
                    </div>
                </div>

                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {discountedProducts.map(p => (
                        <div key={p.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
                                <div className="truncate" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{p.desc}</div>
                                <button onClick={() => removeEntry(p.uid)} style={{ border: 'none', background: 'none', color: 'var(--red)', cursor: 'pointer' }}>×</button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: 'var(--font-display)' }}>{fmt(p.precioFinal)}</div>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>x{p.qty}</span>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(p.subtotalFinal)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="price-final-row" style={{ borderColor: `${accent}30`, background: `${accent}10` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Total Presupuesto</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: 'var(--font-display)' }}>{fmt(totalConDto)}</span>
                </div>

                <div className="divider" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <StatCard label="Tu ganancia" value={fmt(totalGanancia)} valueColor={totalGanancia >= 0 ? 'var(--green)' : 'var(--red)'} />
                    <StatCard label="Margen total" value={pct(totalMargen)} valueColor={mColor(totalMargen)} />
                </div>

                <ExportPDFTemplate
                    ref={pdfTemplateRef}
                    entries={discountedProducts}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                />
            </div>
        </>
    );
}

function exportToWhatsApp(products, total, ahorro) {
    const separator = "--------------------------";
    let text = `Hola! Detalle de precios solicitados:\n\n* PRESUPUESTO *\n${separator}\n`;

    products.forEach(p => {
        text += `- ${p.desc} (x${p.qty}) - ${fmt(p.precioFinal)}\n`;
    });

    text += `${separator}\n`;

    if (ahorro > 0) {
        text += `\n* Ahorro Total: ${fmt(ahorro)}`;
    }

    text += `\n* VALOR FINAL: ${fmt(total)}\n\n${separator}\nCualquier duda me avisas!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
