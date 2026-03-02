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
    const [selectedIds, setSelectedIds] = useState([]);
    const [bundleDiscount, setBundleDiscount] = useState(15);
    const [bundleProductDiscounts, setBundleProductDiscounts] = useState({});
    const [productDiscounts, setProductDiscounts] = useState({});
    const [filterCat, setFilterCat] = useState(() => localStorage.getItem('f_cat') || "Todas");
    const [filterLetra, setFilterLetra] = useState("");
    const [filterMarca, setFilterMarca] = useState("Todas");
    const [filterLinea, setFilterLinea] = useState("Todas");
    const [filterTipoLetra, setFilterTipoLetra] = useState("");
    const [filterTipo, setFilterTipo] = useState("Todos");
    const [filterStock, setFilterStock] = useState("Todos");
    const [filterLista, setFilterLista] = useState(() => localStorage.getItem('f_lista') || "Lista 3");
    const [condicionVenta, setCondicionVenta] = useState(0);
    const [search, setSearch] = useState("");
    const [csvMsg, setCsvMsg] = useState("");
    const [importing, setImporting] = useState(false);
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

    // ── Filtrado ───────────────────────────────────────────────────────────────
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

    const selectedProducts = useMemo(() => productos.filter(p => selectedIds.includes(p.id)), [productos, selectedIds]);

    const hasIndivBundleDisc = Object.values(bundleProductDiscounts).some(v => (v ?? 0) > 0);
    const sliderLocked = hasIndivBundleDisc;
    const inputsLocked = !hasIndivBundleDisc && bundleDiscount > 0;

    const bundleCalc = useMemo(() => {
        if (!selectedProducts.length) return null;
        const costoTotal = selectedProducts.reduce((s, p) => s + p.costo, 0);
        const precioNormal = selectedProducts.reduce((s, p) => s + getPrecio(p), 0);
        const condFactor = 1 - condicionVenta / 100;
        const precioPosCondicion = precioNormal * condFactor;
        const precioBundle = hasIndivBundleDisc
            ? selectedProducts.reduce((s, p) => {
                const pLista = getPrecio(p) * condFactor;
                return s + pLista * (1 - ((bundleProductDiscounts[p.id] ?? 0) / 100));
            }, 0)
            : precioPosCondicion * (1 - bundleDiscount / 100);

        const ganancia = precioBundle - costoTotal;
        const margen = precioBundle > 0 ? (ganancia / precioBundle) * 100 : 0;
        const markup = costoTotal > 0 ? (ganancia / costoTotal) * 100 : 0;
        const ahorro = precioNormal - precioBundle;
        const ahorroCondicion = precioNormal - precioPosCondicion;
        const ahorroPromo = precioPosCondicion - precioBundle;
        return { costoTotal, precioNormal, precioPosCondicion, precioBundle, margen, markup, ganancia, ahorro, ahorroCondicion, ahorroPromo };
    }, [selectedProducts, bundleDiscount, bundleProductDiscounts, hasIndivBundleDisc, getPrecio, condicionVenta]);

    const discountedProducts = useMemo(() => selectedProducts.map(p => {
        const d = productDiscounts[p.id] ?? 0;
        const precioLista = getPrecio(p);
        const precioPosCondicion = precioLista * (1 - condicionVenta / 100);
        const precioFinal = precioPosCondicion * (1 - d / 100);
        const ganancia = precioFinal - p.costo;
        const margen = precioFinal > 0 ? (ganancia / precioFinal) * 100 : 0;
        const markup = p.costo > 0 ? (ganancia / p.costo) * 100 : 0;
        const ahorro = precioLista - precioFinal;
        return { ...p, descuento: d, precioLista, precioPosCondicion, precioFinal, ganancia, margen, markup, ahorro };
    }), [selectedProducts, productDiscounts, getPrecio, condicionVenta]);

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

                // Preparar para Supabase
                const toUpload = enriched.map(p => ({
                    id: p.id,
                    descripcion: p.desc,
                    marca: p.marca,
                    stock: p.stock,
                    costo: p.costo,
                    precio_1: p.precio1,
                    precio_2: p.precio2,
                    precio_3: p.precio3,
                    categoria: p.categoria,
                    tipo: p.tipo
                    // La línea se calcula al vuelo o se puede añadir la columna a la DB
                }));

                setCsvMsg("Sincronizando con la nube (puede demorar)...");
                setStorageStatus("saving");

                // Upsert masivo en lotes (chunks) de 1000 para evitar límites de payload o truncamiento de Supabase
                const chunkSize = 1000;
                for (let i = 0; i < toUpload.length; i += chunkSize) {
                    const chunk = toUpload.slice(i, i + chunkSize);
                    setCsvMsg(`Sincronizando lote ${i / chunkSize + 1}...`);
                    const { error } = await supabase
                        .from('productos')
                        .upsert(chunk, { onConflict: 'id' });

                    if (error) throw error;
                }

                setProductos(enriched);
                setCsvMsg(`✅ ${enriched.length.toLocaleString("es-AR")} sincronizados en la nube`);
                setStorageStatus("saved");
                setStorageInfo(`${enriched.length.toLocaleString("es-AR")} SKUs en la nube`);

                // Reset selección
                setSelectedIds([]); setProductDiscounts({}); setBundleProductDiscounts({}); setBundleDiscount(15);
            } catch (err) {
                setCsvMsg(`❌ ${err.message}`);
                console.error(err);
            } finally {
                setImporting(false);
                setTimeout(() => setCsvMsg(""), 6000);
            }
        };
        reader.readAsText(file);
        if (fileRef.current) fileRef.current.value = "";
    }, []);

    const toggleSelect = useCallback(id => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), []);
    const clearAll = useCallback(() => { setSelectedIds([]); setProductDiscounts({}); setBundleProductDiscounts({}); setBundleDiscount(15); }, []);
    const resetBundleMode = useCallback(() => { setBundleProductDiscounts({}); setBundleDiscount(0); }, []);
    const selectAll = useCallback(() => setSelectedIds(prev => {
        const toAdd = filtered.map(p => p.id).filter(id => !prev.includes(id));
        return [...prev, ...toAdd];
    }), [filtered]);

    return {
        productos, storageStatus, storageInfo, tab, setTab, selectedIds, selectedProducts,
        bundleDiscount, setBundleDiscount, bundleProductDiscounts, setBundleProductDiscounts,
        productDiscounts, setProductDiscounts, filterCat, setFilterCat, filterLetra, setFilterLetra,
        filterMarca, setFilterMarca, filterLinea, setFilterLinea, filterTipo, setFilterTipo,
        filterTipoLetra, setFilterTipoLetra,
        filterStock, setFilterStock, filterLista, setFilterLista, condicionVenta, setCondicionVenta,
        search, setSearch, csvMsg, importing, fileRef, ALPHABET, categorias, marcasByLetra,
        letrasConMarcas, marcasDeLetra, tiposByLetra, letrasConTipos, tiposDeLetra,
        lineas, tipos, filtered, hasIndivBundleDisc,
        sliderLocked, inputsLocked, bundleCalc, discountedProducts, getPrecio,
        handleCSV, toggleSelect, clearAll, resetBundleMode, selectAll,
    };
}
