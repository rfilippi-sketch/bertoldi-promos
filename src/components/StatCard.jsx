import { mColor, mBorder, mLabel, pct } from '../utils/formatters.js';

export function StatCard({ label, value, valueColor = "var(--text-primary)", sub = "" }) {
    return (
        <div className="stat-box">
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: valueColor, fontFamily: "var(--font-display)" }}>{value}</div>
            {sub && <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

export function MarginHealth({ margen }) {
    const color = mColor(margen);
    const border = mBorder(margen);
    const label = mLabel(margen);
    const clamped = Math.min(100, Math.max(0, margen));

    return (
        <div style={{
            borderRadius: 12, padding: "14px 16px",
            border: `1.5px solid ${border}`,
            background: margen > 40 ? "rgba(52,211,153,.07)" : margen > 25 ? "rgba(251,191,36,.07)" : "rgba(248,113,113,.07)",
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>Salud del margen</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 3 }}>{label}</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                    {pct(margen)}
                </div>
            </div>
            <div className="margin-bar-track">
                <div className="margin-bar-fill" style={{
                    width: `${clamped}%`,
                    background: margen > 40
                        ? "linear-gradient(90deg,#10b981,#34d399)"
                        : margen > 25
                            ? "linear-gradient(90deg,#d97706,#fbbf24)"
                            : "linear-gradient(90deg,#dc2626,#f87171)",
                }} />
            </div>
        </div>
    );
}
