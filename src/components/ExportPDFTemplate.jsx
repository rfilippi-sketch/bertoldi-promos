import React, { forwardRef } from 'react';

const ExportPDFTemplate = forwardRef(({ entries, theme }, ref) => {
    // Calculos
    let totalPLista = 0;
    let totalPFinal = 0;

    entries.forEach(e => {
        const precioNormal = e.precio ?? e.precioLista ?? 0;
        const d = e.discount ?? e.descuento ?? 0;
        const precioConD = precioNormal * (1 - d / 100);
        totalPLista += (precioNormal * e.qty);
        totalPFinal += (precioConD * e.qty);
    });

    const ahorro = totalPLista - totalPFinal;

    const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-AR');

    const isDark = theme === 'dark';

    // Forzaremos un diseño específico para el PDF que se vea bien en A4 impreso/digital
    // usando colores puros para la foto, sin depender de variables CSS cambiantes
    const bgColor = isDark ? '#000000' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111111';
    const mutedColor = isDark ? '#71717a' : '#52525b';
    const cardBgColor = isDark ? '#111111' : '#f4f4f5';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';

    return (
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: -9999,
                left: -9999,
                width: '800px',
                backgroundColor: bgColor,
                color: textColor,
                padding: '40px 50px',
                fontFamily: 'Inter, system-ui, sans-serif',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: `2px solid ${borderColor}`, paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                        src="/logo.png"
                        alt="Bertoldi"
                        style={{ height: 48, objectFit: 'contain', filter: isDark ? 'invert(1) brightness(1.2)' : 'none' }}
                    />
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Promos <span style={{ color: '#818cf8' }}>Lab</span></div>
                        <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Propuesta Comercial</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: mutedColor }}>Fecha: {new Date().toLocaleDateString('es-AR')}</div>
                </div>
            </div>

            {/* Intro */}
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>Detalle de tu Promo Exclusiva</div>
            <p style={{ color: mutedColor, fontSize: 16, marginBottom: 30, lineHeight: 1.5, maxWidth: '80%' }}>
                A continuación podés ver el detalle de los productos incluidos en este combo especial, junto con los descuentos aplicados exclusivamente para vos.
            </p>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 40 }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px', color: mutedColor, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Producto</th>
                        <th style={{ padding: '12px 8px', color: mutedColor, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'center' }}>Cant.</th>
                        <th style={{ padding: '12px 8px', color: mutedColor, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'right' }}>P. Lista</th>
                        <th style={{ padding: '12px 8px', color: mutedColor, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'right' }}>Desc.</th>
                        <th style={{ padding: '12px 8px', color: mutedColor, fontWeight: 600, fontSize: 13, textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((e, index) => {
                        const precioLista = e.precio ?? e.precioLista ?? 0;
                        const d = e.discount ?? e.descuento ?? 0;
                        const precioConD = precioLista * (1 - d / 100);
                        return (
                            <tr key={index} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                <td style={{ padding: '16px 8px', fontWeight: 600, fontSize: 14 }}>{e.desc}</td>
                                <td style={{ padding: '16px 8px', textAlign: 'center', fontWeight: 700 }}>x{e.qty}</td>
                                <td style={{ padding: '16px 8px', textAlign: 'right', color: mutedColor, textDecoration: d > 0 ? 'line-through' : 'none' }}>{fmt(precioLista)}</td>
                                <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 700, color: d > 0 ? '#34d399' : mutedColor }}>
                                    {d > 0 ? `-${d}%` : '-'}
                                </td>
                                <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 800 }}>{fmt(precioConD * e.qty)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '350px', backgroundColor: cardBgColor, borderRadius: 12, padding: 24, border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: mutedColor }}>
                        <span>Precio de Lista Total:</span>
                        <span>{fmt(totalPLista)}</span>
                    </div>
                    {ahorro > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: '#34d399', fontWeight: 600 }}>
                            <span>Ahorro Total:</span>
                            <span>-{fmt(ahorro)}</span>
                        </div>
                    )}
                    <div style={{ borderTop: `1px solid ${borderColor}`, margin: '16px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>Valor Final:</span>
                        <span style={{ fontSize: 32, fontWeight: 800, color: '#818cf8', lineHeight: 1 }}>{fmt(totalPFinal)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 60, textAlign: 'center', color: mutedColor, fontSize: 12, borderTop: `1px solid ${borderColor}`, paddingTop: 20 }}>
                Esta propuesta es un documento generado automáticamente. Los precios y descuentos pueden estar sujetos a modificaciones sin previo aviso.<br />
                Gracias por confiar en <strong>Bertoldi</strong>.
            </div>
        </div>
    );
});

export default ExportPDFTemplate;
