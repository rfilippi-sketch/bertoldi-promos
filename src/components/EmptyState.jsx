export default function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="empty-state animate-fadeIn">
            <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>
        </div>
    );
}
