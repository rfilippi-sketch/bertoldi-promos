import React, { useState } from 'react';

export function SavedPromosPanel({ promos, loading, onLoad, onDelete, onRefresh }) {
    const [filter, setFilter] = useState('Todas'); // Todas, Bundle, Individual

    const filtered = promos.filter(p => {
        if (filter === 'Todas') return true;
        return p.tipo.toLowerCase() === filter.toLowerCase();
    });

    const fmt = (val) => val ? `$${Math.round(val).toLocaleString('es-AR')}` : '$0';

    return (
        <div className="card" style={{ marginTop: 20, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)' }}>Historial de Promos</h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Repasá o reutilizá tus ofertas guardadas</p>
                </div>
                <button
                    onClick={onRefresh}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 20 }}
                    title="Actualizar"
                >
                    ↻
                </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['Todas', 'Bundle', 'Individual'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid var(--border)',
                            background: filter === f ? 'var(--accent)' : 'transparent',
                            color: filter === f ? '#fff' : 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all .2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>Cargando historial...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 8 }}>
                    No hay promociones guardadas en esta categoría.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {filtered.map(p => (
                        <div
                            key={p.id}
                            className="promo-item-card"
                            style={{
                                padding: 12,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-elevated)',
                                transition: 'transform .2s',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: p.tipo === 'bundle' ? 'var(--accent)' : 'var(--green)',
                                    background: p.tipo === 'bundle' ? 'var(--accent-light)' : 'var(--green-bg)',
                                    padding: '2px 6px',
                                    borderRadius: 4
                                }}>
                                    {p.tipo}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    Usada {p.veces_usada} {p.veces_usada === 1 ? 'vez' : 'veces'}
                                </span>
                            </div>

                            <h4 style={{ margin: '0 0 4px 0', fontSize: 15 }}>{p.nombre}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {fmt(p.totales?.precioBundle || p.totales?.totalConDto)}
                                    <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 6 }}>
                                        (save {fmt(p.totales?.ahorroTotal || p.totales?.totalAhorro)})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => onDelete(p.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => onLoad(p)}
                                        style={{
                                            background: 'var(--accent)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cargar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
