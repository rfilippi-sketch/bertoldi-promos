import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Limpiar errores al cambiar de modo
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [isRegister]);

    const handleLogin = async () => {
        const { data, error: dbError } = await supabase
            .from('usuarios_app')
            .select('*')
            .eq('usuario', username.toLowerCase())
            .single();

        if (dbError || !data) {
            setError('Usuario no encontrado');
            return;
        }

        if (data.password !== password) {
            setError('Contraseña incorrecta');
            return;
        }

        if (data.estado === 'bloqueado') {
            setError('Tu cuenta está bloqueada por inactividad. Contactá al administrador.');
            return;
        }

        if (data.estado === 'pendiente') {
            setError('Tu cuenta aún no fue activada por el administrador.');
            return;
        }

        // Actualizar último login
        await supabase
            .from('usuarios_app')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', data.id);

        onLogin({
            id: data.id,
            username: data.usuario,
            name: data.nombre,
            role: data.rol
        });
    };

    const handleRegister = async () => {
        if (!nombre.trim() || !username.trim() || !password.trim()) {
            setError('Completá todos los campos');
            return;
        }

        const { error: dbError } = await supabase
            .from('usuarios_app')
            .insert([{
                nombre,
                usuario: username.toLowerCase(),
                password,
                rol: 'user',
                estado: 'pendiente'
            }]);

        if (dbError) {
            if (dbError.code === '23505') setError('El nombre de usuario ya existe');
            else setError('Error al registrar usuario');
            return;
        }

        setSuccess('Registro solicitado. El administrador debe activarte.');
        setTimeout(() => setIsRegister(false), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isRegister) await handleRegister();
            else await handleLogin();
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
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
                    {isRegister ? 'Crear nueva cuenta de vendedor' : 'Bertoldi · Herramienta Interna de Promociones'}
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="login-error">❌ {error}</div>}
                    {success && <div style={{ fontSize: 12, color: '#10b981', background: '#ecfdf5', padding: '10px', borderRadius: 8, marginBottom: 15, textAlign: 'center' }}>✅ {success}</div>}

                    {isRegister && (
                        <div className="login-field">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="ej: Juan Pérez"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label>Usuario</label>
                        <input
                            type="text"
                            placeholder="ej: juan.perez"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '⏳ Procesando…' : (isRegister ? 'Solicitar Registro' : 'Ingresar')}
                    </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                    >
                        {isRegister ? '¿Ya tenés cuenta? Ingresá acá' : '¿No tenés cuenta? Registrate acá'}
                    </button>
                </div>
            </div>
        </div>
    );
}
