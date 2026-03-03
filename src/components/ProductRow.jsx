import { CAT_COLOR } from '../constants/categories.js';
import { fmt } from '../utils/formatters.js';

export const ROW_H = 76;

export default function ProductRow({ p, selected, onToggle, getPrecio }) {
    const accent = CAT_COLOR[p.categoria] || "var(--accent)";
    const precio = getPrecio(p);
    const stockLow = p.stock < 20;

    return (
        <div
            className={`row-prod ${selected ? "selected" : ""}`}
            style={{ minHeight: ROW_H, "--accent": accent, cursor: "pointer" }}
            onClick={() => onToggle(p.id)}
        >
            {/* Multi-add indicator */}
            <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${selected ? accent : "var(--border)"}`,
                background: selected ? `${accent}15` : "transparent",
                color: selected ? accent : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, transition: "all .15s",
            }}>
                +
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
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    {fmt(precio)}
                </div>
            </div>
        </div>
    );
}
