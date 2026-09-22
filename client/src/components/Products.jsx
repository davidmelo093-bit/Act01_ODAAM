import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3005';

export default function Products({ token, username, onLogout }) {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ username, product_count: 0 });
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/products`);
            setProducts(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        const res = await fetch(`${API}/users/me/stats`, { headers: authHeaders });
        if (res.ok) setStats(await res.json());
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchProducts();
        fetchStats();
    }, [fetchProducts, fetchStats]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch(`${API}/products`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ name: newName, price: Number(newPrice) }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Error al crear'); return; }
        setProducts(prev => [...prev, data]);
        setStats(prev => ({ ...prev, product_count: prev.product_count + 1 })); // reactividad local
        setNewName(''); setNewPrice('');
    };

    return (
        <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Header con contador */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>
                    Catálogo — <span style={{ color: '#1976d2' }}>{stats.username} ({stats.product_count})</span>
                </h2>
                <button onClick={onLogout} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>
                    Cerrar sesión
                </button>
            </div>

            {/* Formulario crear producto (solo admins verán éxito) */}
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del producto" required
                    style={{ flex: 2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Precio" type="number" min="0.01" step="0.01" required
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <button type="submit" style={{ padding: '8px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Agregar
                </button>
            </form>
            {error && <p style={{ color: 'red', margin: '0 0 12px' }}>{error}</p>}

            {/* Tabla de productos */}
            {loading ? <p>Cargando...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                            <th style={th}>#</th>
                            <th style={th}>Nombre</th>
                            <th style={th}>Precio</th>
                            <th style={th}>Creado por</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={td}>{i + 1}</td>
                                <td style={td}>{p.name}</td>
                                <td style={td}>${Number(p.price).toFixed(2)}</td>
                                <td style={{ ...td, color: '#555', fontStyle: 'italic' }}>
                                    {p.created_by_username ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: '600' };
const td = { padding: '10px 12px' };
