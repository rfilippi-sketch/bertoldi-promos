import { CAT_COLOR } from '../constants/categories.js';
import { fmt } from '../utils/formatters.js';

export const ROW_H = 76;

export default function ProductRow({ p, selected, tab, productDiscount, onToggle, onDiscountChange, getPrecio }) {
    const accent = CAT_COLOR[p.categoria] || "var(--accent)";
    const precio = getPrecio(p);
    const stockLow = p.stock < 20;

    return (
        <div
            className={`row-prod ${selected ? "selected" : ""}`}
            style={{ minHeight: ROW_H, "--accent": accent }}
            onClick={() => onToggle(p.id)}
        >
            {/* Checkbox */}
            <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${selected ? accent : "var(--border-strong)"}`,
                background: selected ? accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s", boxShadow: selected ? `0 0 0 3px ${accent}30` : "none",
            }}>
                {selected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>

            {/* Accent bar */}
            <div style={{ width: 3, height: 36, borderRadius: 2, background: selected ? accent : "var(--border)", flexShrink: 0, transition: "all .15s" }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="truncate" style={{
                    fontSize: 13, fontWeight: 600,
                    color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                    fontFamily: "var(--font-display)", marginBottom: 5,
                }}>
                    {p.desc}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <span className="chip" style={{ background: "rgba(255,255,255,.05)", color: "var(--text-muted)" }}>
                        SKU&nbsp;{String(p.id).padStart(6, "0")}
                    </span>
                    <span className="chip" style={{ background: `${accent}18`, color: accent }}>{p.marca}</span>
                    <span className="chip">{p.linea}</span>
                    <span className="chip">{p.tipo}</span>
                    <span className="chip" style={{
                        background: stockLow ? "var(--red-bg)" : "rgba(255,255,255,.05)",
                        color: stockLow ? "var(--red)" : "var(--text-muted)",
                    }}>
                        {stockLow ? "⚠️ " : ""}Stock: {p.stock}
                    </span>
                </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    {fmt(precio)}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>costo {fmt(p.costo)}</div>
            </div>

            {/* Discount input (descuento tab only) */}
            {tab === "descuento" && selected && (
                <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0, textAlign: "center", marginLeft: 6 }}>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Dto %</div>
                    <input type="number" min={0} max={100} step={1} value={productDiscount}
                        onChange={e => onDiscountChange(p.id, Math.min(100, Math.max(0, Number(e.target.value))))} />
                </div>
            )}
        </div>
    );
}
