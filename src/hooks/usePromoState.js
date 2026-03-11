import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { enrich } from '../utils/detectors.js';
import { parseCSV } from '../utils/csvParser.js';
import SEED_PRODUCTS from '../productos.json';

const seedEnriched = SEED_PRODUCTS.map(p => enrich({
    ...p,
    precio1: p.precio1 ?? p.precio ?? 0,
    precio2: p.precio2 ?? p.precio ?? 0,
    precio3: p.precio3 ?? p.precio ?? 0,
}));

export function usePromoState() {
    const [productos, setProductos] = useState([]);
    const [storageStatus, setStorageStatus] = useState("loading");
    const [storageInfo, setStorageInfo] = useState("");
    const [tab, setTab] = useState(() => localStorage.getItem('f_tab') || "bundle");
    const [selectedItems, setSelectedItems] = useState([]); // [{ uid, id, qty, discount }]
    const [bundleDiscount, setBundleDiscount] = useState(0);
    const [filterCat, setFilterCat] = useState(() => localStorage.getItem('f_cat') || "Todas");
    const [filterLetra, setFilterLetra] = useState("");
    const [filterMarca, setFilterMarca] = useState("Todas");
    const [filterLinea, setFilterLinea] = useState("Todas");
    const [filterTipoLetra, setFilterTipoLetra] = useState("");
    const [filterTipo, setFilterTipo] = useState("Todos");
    const [filterStock, setFilterStock] = useState("Todos");
    const [filterLista, setFilterLista] = useState(() => localStorage.getItem('f_lista') || "Lista 3");
    const [condicionVenta, setCondicionVenta] = useState(0); // 0, 13, 15
    const [condicionExtra, setCondicionExtra] = useState(0); // 0 (Cta Cte), 10 (Contado)
    const [search, setSearch] = useState("");
    const [csvMsg, setCsvMsg] = useState("");
    const [importing, setImporting] = useState(false);
    const [user, setUser] = useState(null);
    const [savedPromos, setSavedPromos] = useState([]);
    const [loadingPromos, setLoadingPromos] = useState(false);
    const fileRef = useRef();

    // ── Persistencia de preferencias locales ──────────────────────────────────
    useEffect(() => {
        localStorage.setItem('f_tab', tab);
        localStorage.setItem('f_cat', filterCat);
        localStorage.setItem('f_lista', filterLista);
    }, [tab, filterCat, filterLista]);

    // ── Cargar desde Supabase ──────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setStorageStatus("loading");
        try {
            let allData = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .range(page * pageSize, (page + 1) * pageSize - 1)
                    .order('id', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    allData = [...allData, ...data];
                    if (data.length < pageSize) hasMore = false;
                    page++;
                    // Mostrar progreso opcionalmente
                    setStorageInfo(`Sincronizando ${allData.length.toLocaleString("es-AR")}...`);
                } else {
                    hasMore = false;
                }
            }

            if (allData.length > 0) {
                const mapped = allData.map(p => ({
                    id: p.id,
                    desc: p.descripcion,
                    marca: p.marca,
                    stock: p.stock,
                    costo: p.costo,
                    precio1: p.precio_1,
                    precio2: p.precio_2,
                    precio3: p.precio_3,
                    categoria: p.categoria,
                    tipo: p.tipo,
                    linea: ''
                }));
                const enriched = mapped.map(enrich);
                setProductos(enriched);
                setStorageStatus("loaded");
                setStorageInfo(`${enriched.length.toLocaleString("es-AR")} SKUs en la nube`);
            } else {
                setStorageStatus("seed");
                setStorageInfo("nube vacía — importá tu CSV");
                setProductos(seedEnriched);
            }
        } catch (err) {
            console.error('Error fetching Supabase:', err);
            setStorageStatus("error");
            setStorageInfo("error de conexión con la nube");
        }
    }, [seedEnriched]);

    useEffect(() => {
        fetchProducts();
        // Heartbeat para Supabase (evita pausa por inactividad)
        const keepAlive = async () => {
            try { await supabase.from('productos').select('id').limit(1); } catch (e) { console.warn("Heartbeat fallido", e); }
        };
        keepAlive();
        const interval = setInterval(keepAlive, 1000 * 60 * 60 * 24); // Una vez al día es suficiente para "actividad"
        return () => clearInterval(interval);
    }, [fetchProducts]);

    // ── Lista activa → precio del producto ────────────────────────────────────
    const getPrecio = useCallback((p) => {
        if (filterLista === "Lista 1") return p.precio1 || p.precio3 || 0;
        if (filterLista === "Lista 2") return p.precio2 || p.precio3 || 0;
        return p.precio3 || 0;
    }, [filterLista]);

    // ── Metadatos de filtros (Memoized) ─────────────────────────────────────────
    const ALPHABET = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const categorias = useMemo(() => ["Todas", ...Array.from(new Set(productos.map(p => p.categoria))).sort()], [productos]);

    const marcasByLetra = useMemo(() => {
        const all = Array.from(new Set(productos.map(p => p.marca))).sort();
        const g = {};
        for (const m of all) {
            if (!m) continue;
            // Solo procesar si empieza con una letra
            if (/^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(m)) {
                const l = m[0].toUpperCase();
                if (!g[l]) g[l] = [];
                g[l].push(m);
            }
        }
        return g;
    }, [productos]);

    const letrasConMarcas = useMemo(() => new Set(Object.keys(marcasByLetra)), [marcasByLetra]);
    const marcasDeLetra = useMemo(() => (filterLetra ? marcasByLetra[filterLetra] || [] : []), [marcasByLetra, filterLetra]);

    const lineas = useMemo(() => {
        const base = filterCat === "Todas" ? productos : productos.filter(p => p.categoria === filterCat);
        return ["Todas", ...Array.from(new Set(base.map(p => p.linea))).sort()];
    }, [productos, filterCat]);

    const tiposByLetra = useMemo(() => {
        const base = productos.filter(p =>
            (filterCat === "Todas" || p.categoria === filterCat) &&
            (filterLinea === "Todas" || p.linea === filterLinea)
        );
        const all = Array.from(new Set(base.map(p => p.tipo))).sort();
        const g = {};
        for (const t of all) {
            if (!t) continue;
            // Filtrar tipos que sean solo números (ej: 0.00, 101.00)
            if (/^\d+(\.\d+)?$/.test(t.replace(",", "."))) continue;

            if (/^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t)) {
                const l = t[0].toUpperCase();
                if (!g[l]) g[l] = [];
                g[l].push(t);
            }
        }
        return g;
    }, [productos, filterCat, filterLinea]);

    const letrasConTipos = useMemo(() => new Set(Object.keys(tiposByLetra)), [tiposByLetra]);
    const tiposDeLetra = useMemo(() => (filterTipoLetra ? tiposByLetra[filterTipoLetra] || [] : []), [tiposByLetra, filterTipoLetra]);

    const tipos = useMemo(() => {
        const base = productos.filter(p =>
            (filterCat === "Todas" || p.categoria === filterCat) &&
            (filterLinea === "Todas" || p.linea === filterLinea)
        );
        const unique = Array.from(new Set(base.map(p => p.tipo)))
            .filter(t => t && !/^\d+(\.\d+)?$/.test(t.replace(",", ".")))
            .sort();
        return ["Todos", ...unique];
    }, [productos, filterCat, filterLinea]);

    const filtered = useMemo(() => productos.filter(p => {
        if (filterCat !== "Todas" && p.categoria !== filterCat) return false;
        if (filterMarca !== "Todas" && p.marca !== filterMarca) return false;
        if (filterLinea !== "Todas" && p.linea !== filterLinea) return false;
        if (filterTipo !== "Todos" && p.tipo !== filterTipo) return false;
        if (filterStock === "Con Stock" && p.stock <= 0) return false;
        if (filterStock === "Sin Stock" && p.stock > 0) return false;
        if (search) {
            const terms = search.toLowerCase().split(" ").filter(t => t.trim());
            if (terms.length > 0) {
                const text = `${p.desc} ${p.marca} ${String(p.id).padStart(6, "0")}`.toLowerCase();
                if (!terms.every(t => text.includes(t))) return false;
            }
        }
        return true;
    }), [productos, filterCat, filterMarca, filterLinea, filterTipo, search, filterStock]);

    const selectedEntries = useMemo(() => {
        return selectedItems.map(item => {
            const p = productos.find(p => p.id === item.id);
            if (!p) return null;
            return { ...p, ...item };
        }).filter(Boolean);
    }, [productos, selectedItems]);

    const hasIndivBundleDisc = selectedItems.some(item => item.discount > 0);
    const sliderLocked = hasIndivBundleDisc;
    const inputsLocked = !hasIndivBundleDisc && bundleDiscount > 0;

    const bundleCalc = useMemo(() => {
        if (!selectedEntries.length) return null;
        const costoTotal = selectedEntries.reduce((s, e) => s + (e.isFree ? 0 : e.costo * e.qty), 0);
        const precioNormal = selectedEntries.reduce((s, e) => s + (getPrecio(e) * e.qty), 0);
        const condFactor = 1 - condicionVenta / 100;
        const extraFactor = 1 - condicionExtra / 100;
        const precioPosCondicion = precioNormal * condFactor * extraFactor;

        const precioBundle = hasIndivBundleDisc
            ? selectedEntries.reduce((s, e) => {
                const pLista = getPrecio(e) * condFactor * extraFactor;
                return s + (pLista * (1 - (e.discount / 100)) * e.qty);
            }, 0)
            : precioPosCondicion * (1 - bundleDiscount / 100);

        const ganancia = precioBundle - costoTotal;
        const margen = precioBundle > 0 ? (ganancia / precioBundle) * 100 : 0;
        const markup = costoTotal > 0 ? (ganancia / costoTotal) * 100 : 0;
        const ahorroTotal = precioNormal - precioBundle;
        return { costoTotal, precioNormal, precioPosCondicion, precioBundle, margen, markup, ganancia, ahorroTotal };
    }, [selectedEntries, bundleDiscount, hasIndivBundleDisc, getPrecio, condicionVenta, condicionExtra]);

    const discountedProducts = useMemo(() => selectedEntries.map(e => {
        const precioLista = getPrecio(e);
        const condFactor = 1 - condicionVenta / 100;
        const extraFactor = 1 - condicionExtra / 100;
        const precioPosCondicion = precioLista * condFactor * extraFactor;
        const precioFinal = precioPosCondicion * (1 - e.discount / 100);
        const subtotalCosto = e.isFree ? 0 : (e.costo * e.qty);
        const subtotalFinal = precioFinal * e.qty;
        const ganancia = subtotalFinal - subtotalCosto;
        const margen = subtotalFinal > 0 ? (ganancia / subtotalFinal) * 100 : 0;
        const markup = subtotalCosto > 0 ? (ganancia / subtotalCosto) * 100 : 0;
        return {
            ...e,
            descuento: e.discount,
            precioLista,
            precioPosCondicion,
            precioFinal,
            subtotalFinal,
            ganancia,
            margen,
            markup
        };
    }), [selectedEntries, getPrecio, condicionVenta, condicionExtra]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCSV = useCallback((e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const raw = parseCSV(ev.target.result);
                if (raw.length === 0) throw new Error("No se encontraron productos válidos");
                const enriched = raw.map(enrich);
                const toUpload = enriched.map(p => ({
                    id: p.id, descripcion: p.desc, marca: p.marca, stock: p.stock,
                    costo: p.costo, precio_1: p.precio1, precio_2: p.precio2, precio_3: p.precio3,
                    categoria: p.categoria, tipo: p.tipo
                }));
                setCsvMsg("Sincronizando con la nube...");
                setStorageStatus("saving");
                const chunkSize = 1000;
                for (let i = 0; i < toUpload.length; i += chunkSize) {
                    const chunk = toUpload.slice(i, i + chunkSize);
                    const { error } = await supabase.from('productos').upsert(chunk, { onConflict: 'id' });
                    if (error) throw error;
                }
                setProductos(enriched);
                setCsvMsg(`✅ ${enriched.length.toLocaleString("es-AR")} sincronizados`);
                setStorageStatus("saved");
                setStorageInfo(`${enriched.length.toLocaleString("es-AR")} SKUs`);
                setSelectedItems([]);
            } catch (err) {
                setCsvMsg(`❌ ${err.message}`);
                console.error(err);
            } finally {
                setImporting(false);
                setTimeout(() => setCsvMsg(""), 6000);
            }
        };
        reader.readAsText(file);
    }, []);

    const toggleSelect = useCallback(id => {
        setSelectedItems(prev => {
            const exists = prev.some(item => item.id === id);
            if (exists) return prev.filter(item => item.id !== id);
            return [...prev, { uid: crypto.randomUUID(), id, qty: 0, discount: 0, isFree: false }];
        });
    }, []);

    const addEntry = useCallback(id => {
        setSelectedItems(prev => [...prev, { uid: crypto.randomUUID(), id, qty: 0, discount: 0, isFree: false }]);
    }, []);

    const removeEntry = useCallback(uid => {
        setSelectedItems(prev => prev.filter(item => item.uid !== uid));
    }, []);

    const updateEntry = useCallback((uid, changes) => {
        setSelectedItems(prev => prev.map(item => item.uid === uid ? { ...item, ...changes } : item));
    }, []);

    const clearAll = useCallback(() => { setSelectedItems([]); setBundleDiscount(0); }, []);
    const resetBundleMode = useCallback(() => {
        setSelectedItems(prev => prev.map(item => ({ ...item, discount: 0 })));
        setBundleDiscount(0);
    }, []);

    const selectAll = useCallback(() => {
        setSelectedItems(prev => {
            const next = [...prev];
            filtered.forEach(p => {
                if (!next.some(item => item.id === p.id)) {
                    next.push({ uid: crypto.randomUUID(), id: p.id, qty: 0, discount: 0, isFree: false });
                }
            });
            return next;
        });
    }, [filtered]);

    // ── Historial de Promociones ─────────────────────────────────────────────
    const fetchSavedPromos = useCallback(async () => {
        setLoadingPromos(true);
        try {
            const { data, error } = await supabase
                .from('promociones_guardadas')
                .select('*')
                .order('veces_usada', { ascending: false });
            if (error) throw error;
            setSavedPromos(data || []);
        } catch (err) {
            console.error('Error fetching promos:', err);
        } finally {
            setLoadingPromos(false);
        }
    }, []);

    const savePromo = async (nombre, tipo, items, totales) => {
        try {
            const { error } = await supabase.from('promociones_guardadas').insert([{
                nombre,
                tipo,
                datos: items,
                totales,
                creado_por: user?.nombre || 'usuario'
            }]);
            if (error) throw error;
            fetchSavedPromos();
            return { success: true };
        } catch (err) {
            console.error('Error saving promo:', err);
            return { success: false, error: err.message };
        }
    };

    const deletePromo = async (id) => {
        try {
            const { error } = await supabase.from('promociones_guardadas').delete().eq('id', id);
            if (error) throw error;
            setSavedPromos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting promo:', err);
        }
    };

    const loadPromo = (promo) => {
        setTab(promo.tipo);
        setSelectedItems(promo.datos.map(d => ({ ...d, uid: crypto.randomUUID() })));
        if (promo.tipo === 'bundle') {
            const disc = promo.datos[0]?.discount || 0;
            if (promo.datos.every(d => d.discount === disc)) {
                setBundleDiscount(disc);
            }
        }
        // Incrementar uso
        supabase.rpc('increment_promo_usage', { promo_id: promo.id }).catch(() => { });
    };

    useEffect(() => {
        fetchSavedPromos();
    }, [fetchSavedPromos]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_bertoldi');
    };

    return {
        productos, storageStatus, storageInfo, tab, setTab, selectedItems, selectedEntries,
        bundleDiscount, setBundleDiscount, filterCat, setFilterCat, filterLetra, setFilterLetra,
        filterMarca, setFilterMarca, filterLinea, setFilterLinea, filterTipo, setFilterTipo,
        filterTipoLetra, setFilterTipoLetra, filterStock, setFilterStock, filterLista, setFilterLista,
        condicionVenta, setCondicionVenta, condicionExtra, setCondicionExtra,
        search, setSearch, csvMsg, importing, fileRef, ALPHABET, categorias, marcasByLetra,
        letrasConMarcas, marcasDeLetra, tiposByLetra, letrasConTipos, tiposDeLetra,
        lineas, tipos, filtered, hasIndivBundleDisc,
        sliderLocked, inputsLocked, bundleCalc, discountedProducts, getPrecio,
        handleCSV, toggleSelect, addEntry, removeEntry, updateEntry, clearAll, resetBundleMode, selectAll, user, setUser, logout,
        savedPromos, loadingPromos, savePromo, deletePromo, loadPromo, fetchSavedPromos
    };
}
