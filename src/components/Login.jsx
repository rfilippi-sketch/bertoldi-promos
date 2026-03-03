import { useState } from 'react';

// Usuarios predefinidos (en producción esto vendría de una base de datos)
const USERS = [
    { username: 'admin', password: 'bertoldi2026', role: 'admin', name: 'Administrador' },
    { username: 'usuario1', password: 'promo1', role: 'user', name: 'Usuario 1' },
    { username: 'usuario2', password: 'promo2', role: 'user', name: 'Usuario 2' },
    { username: 'usuario3', password: 'promo3', role: 'user', name: 'Usuario 3' },
    { username: 'usuario4', password: 'promo4', role: 'user', name: 'Usuario 4' },
    { username: 'usuario5', password: 'promo5', role: 'user', name: 'Usuario 5' },
    { username: 'usuario6', password: 'promo6', role: 'user', name: 'Usuario 6' },
    { username: 'usuario7', password: 'promo7', role: 'user', name: 'Usuario 7' },
    { username: 'usuario8', password: 'promo8', role: 'user', name: 'Usuario 8' },
    { username: 'usuario9', password: 'promo9', role: 'user', name: 'Usuario 9' },
    { username: 'usuario10', password: 'promo10', role: 'user', name: 'Usuario 10' },
];

export function authenticateUser(username, password) {
    const u = USERS.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (u) return { username: u.username, name: u.name, role: u.role };
    return null;
}

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Completá usuario y contraseña');
            return;
        }
        setLoading(true);
        // Simulate brief delay for UX
        setTimeout(() => {
            const user = authenticateUser(username, password);
            if (user) {
                onLogin(user);
            } else {
                setError('Usuario o contraseña incorrectos');
            }
            setLoading(false);
        }, 400);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28,
                        boxShadow: '0 4px 16px rgba(99,102,241,.3)',
                    }}>🎯</div>
                </div>

                <div className="login-title">
                    Promos <span style={{ color: 'var(--accent)' }}>Lab</span> <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400, marginLeft: 8 }}>v1.1</span>
                </div>
                <div className="login-subtitle">
                    Bertoldi · Herramienta Interna de Promociones
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="login-error">❌ {error}</div>}

                    <div className="login-field">
                        <label htmlFor="login-user">Usuario</label>
                        <input
                            id="login-user"
                            type="text"
                            placeholder="ej: admin"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-pass">Contraseña</label>
                        <input
                            id="login-pass"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '⏳ Ingresando…' : 'Ingresar'}
                    </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-placeholder)' }}>
                    Si no tenés credenciales, pedíselas al administrador.
                </div>
            </div>
        </div>
    );
}
