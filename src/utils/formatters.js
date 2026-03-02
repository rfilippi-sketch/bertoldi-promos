export const fmt = n => `$${Math.round(n).toLocaleString("es-AR")}`;
export const pct = n => `${n.toFixed(1)}%`;

export const mColor = m => m > 40 ? "#34d399" : m > 25 ? "#fbbf24" : "#f87171";
export const mBg = m => m > 40 ? "rgba(52,211,153,.1)" : m > 25 ? "rgba(251,191,36,.1)" : "rgba(248,113,113,.1)";
export const mBorder = m => m > 40 ? "rgba(52,211,153,.3)" : m > 25 ? "rgba(251,191,36,.3)" : "rgba(248,113,113,.3)";
export const mLabel = m => m > 40 ? "✅ Excelente" : m > 25 ? "⚠️ Aceptable" : "❌ Revisar descuento";
