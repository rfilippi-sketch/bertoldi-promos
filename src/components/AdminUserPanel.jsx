import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { fmt } from '../utils/formatters.js';

export default function AdminUserPanel({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('usuarios_app')
            .select('*')
            .order('ultimo_login', { ascending: false });

        if (!error) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUserStatus = async (userId, newStatus) => {
        const { error } = await supabase
            .from('usuarios_app')
            .update({ estado: newStatus })
            .eq('id', userId);

        if (!error) {
            setMsg({ text: `Usuario ${newStatus === 'activo' ? 'activado' : 'bloqueado'} con éxito`, type: 'success' });
            fetchUsers();
        } else {
            setMsg({ text: 'Error al actualizar usuario', type: 'error' });
        }
    };

    const checkInactivity = async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Bloquear usuarios activos que no loguearon en 7 días
        // No bloqueamos admins
        const { data, error } = await supabase
            .from('usuarios_app')
            .update({ estado: 'bloqueado' })
            .eq('estado', 'activo')
            .eq('rol', 'user')
            .lt('ultimo_login', sevenDaysAgo.toISOString());

        if (!error) {
            setMsg({ text: 'Limpieza de inactividad completada', type: 'success' });
            fetchUsers();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Nunca';
        const d = new Date(dateStr);
        return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 18 }}>Gestión de Usuarios</h2>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>

                {msg.text && (
                    <div style={{
                        padding: '10px', borderRadius: 8, marginBottom: 15, fontSize: 12, textAlign: 'center',
                        background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: msg.type === 'success' ? '#10b981' : '#ef4444',
                        border: `1px solid ${msg.type === 'success' ? '#10b98130' : '#ef444430'}`
                    }}>
                        {msg.text}
                    </div>
                )}

                <div style={{ marginBottom: 20 }}>
                    <button onClick={checkInactivity} className="btn-action" style={{ background: 'var(--amber)', color: '#fff' }}>
                        🛡️ Ejecutar Bloqueo por Inactividad (7 días)
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Cargando usuarios...</div>
                ) : (
                    <div className="admin-user-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre / Usuario</th>
                                    <th>Estado</th>
                                    <th>Último Acceso</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{u.usuario}</div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${u.estado}`}>
                                                {u.estado}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 11 }}>{formatDate(u.ultimo_login)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 5 }}>
                                                {u.estado !== 'activo' && (
                                                    <button onClick={() => updateUserStatus(u.id, 'activo')} className="btn-mini success">Activar</button>
                                                )}
                                                {u.estado === 'activo' && u.rol !== 'admin' && (
                                                    <button onClick={() => updateUserStatus(u.id, 'bloqueado')} className="btn-mini danger">Bloquear</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .admin-modal-overlay {
                    position: fixed; top:0; left:0; right:0; bottom:0;
                    background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .admin-modal {
                    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
                    padding: 24px; border-radius: 20px;
                }
                .admin-user-list table {
                    width: 100%; border-collapse: collapse;
                }
                .admin-user-list th {
                    text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-muted);
                    padding: 10px; border-bottom: 2px solid var(--border);
                }
                .admin-user-list td {
                    padding: 12px 10px; border-bottom: 1px solid var(--border);
                }
                .status-badge {
                    padding: 2px 8px; borderRadius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;
                }
                .status-badge.activo { background: #ecfdf5; color: #10b981; }
                .status-badge.bloqueado { background: #fef2f2; color: #ef4444; }
                .status-badge.pendiente { background: #fffbeb; color: #f59e0b; }
                
                .btn-mini {
                    padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
                }
                .btn-mini.success { background: #10b981; color: white; }
                .btn-mini.danger { background: #ef4444; color: white; }
                .btn-close {
                    background: var(--bg-surface); border: 1px solid var(--border); width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
                }
            `}</style>
        </div>
    );
}
