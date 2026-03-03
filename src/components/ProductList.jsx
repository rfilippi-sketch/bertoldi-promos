import { useState } from 'react';
import ProductRow, { ROW_H } from './ProductRow.jsx';

const GAP = 6;

function VirtualList({ items, visibleHeight, renderRow }) {
    const [scrollTop, setScrollTop] = useState(0);
    const rowStride = ROW_H + GAP;
    const totalHeight = items.length * rowStride - GAP;
    const startIdx = Math.max(0, Math.floor(scrollTop / rowStride) - 4);
    const endIdx = Math.min(items.length - 1, Math.ceil((scrollTop + visibleHeight) / rowStride) + 4);
    const visible = items.slice(startIdx, endIdx + 1);

    return (
        <div style={{ height: visibleHeight, overflowY: "auto", position: "relative" }}
            onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
            <div style={{ height: totalHeight, position: "relative" }}>
                <div style={{ position: "absolute", top: startIdx * rowStride, left: 0, right: 0, display: "flex", flexDirection: "column", gap: GAP }}>
                    {visible.map((item, i) => renderRow(item, startIdx + i))}
                </div>
            </div>
        </div>
    );
}

export default function ProductList({
    filtered, selectedItems, tab, addEntry, getPrecio,
}) {
    const selectedCount = (selectedItems || []).length;

    return (
        <div className="card animate-fadeIn" style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Productos</span>
                    <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: "var(--accent)", background: "var(--accent-light)",
                        padding: "2px 10px", borderRadius: 6, fontFamily: "var(--font-display)",
                    }}>
                        {filtered.length.toLocaleString("es-AR")} resultado{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {selectedCount > 0 && (
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "var(--green)",
                        background: "var(--green-bg)", padding: "3px 10px", borderRadius: 6,
                        textTransform: "uppercase", border: "1px solid rgba(16,185,129,.2)"
                    }}>
                        🛒 {selectedCount} en presupuesto
                    </div>
                )}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "48px 20px" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontWeight: 600 }}>Sin resultados</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Probá ajustando los filtros</div>
                </div>
            ) : (
                <VirtualList
                    items={filtered}
                    visibleHeight={520}
                    renderRow={(p) => (
                        <ProductRow
                            key={p.id}
                            p={p}
                            selected={selectedItems.some(item => item.id === p.id)}
                            tab={tab}
                            onToggle={() => addEntry(p.id)}
                            getPrecio={getPrecio}
                        />
                    )}
                />
            )}
        </div>
    );
}
