import { useState } from 'react';
import { CAT_COLOR, CAT_EMOJI, CONDICIONES_VENTA } from '../constants/categories.js';

function Pill({ label, active, onClick, color = "var(--accent)", emoji }) {
    return (
        <button className={`pill ${active ? "pill--active" : ""}`} onClick={onClick}
            style={active ? { background: color, boxShadow: `0 3px 10px ${color}60` } : {}}>
            {emoji && <span>{emoji}</span>}
            {label}
        </button>
    );
}

function SectionLabel({ children, onSearchChange, searchValue, placeholder = "Buscar..." }) {
    return (
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="section-label" style={{ margin: 0 }}>{children}</div>
            {onSearchChange && (
                <div className="mini-search">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

export default function FilterPanel({
    // filters
    filterCat, setFilterCat,
    filterLetra, setFilterLetra,
    filterMarca, setFilterMarca,
    filterLinea, setFilterLinea,
    filterTipo, setFilterTipo,
    filterTipoLetra, setFilterTipoLetra,
    filterStock, setFilterStock,
    filterLista, setFilterLista,
    condicionVenta, setCondicionVenta,
    condicionExtra, setCondicionExtra,
    search, setSearch,
    // data
    categorias, ALPHABET, letrasConMarcas, marcasDeLetra, lineas, tipos,
    letrasConTipos, tiposDeLetra,
}) {
    const [searchMarca, setSearchMarca] = useState("");
    const [searchLinea, setSearchLinea] = useState("");
    const [searchTipo, setSearchTipo] = useState("");

    const accent = CAT_COLOR[filterCat] || "var(--accent)";

    const handleCatClick = (c) => {
        setFilterCat(c);
        setFilterLinea("Todas");
        setFilterTipo("Todos");
        setFilterTipoLetra("");
        setSearchLinea("");
        setSearchTipo("");
    };

    const handleMarcaClick = (m) => {
        setFilterMarca(m);
        setFilterLinea("Todas");
        setFilterTipo("Todos");
        setFilterTipoLetra("");
        setSearchTipo("");
    };

    // Filtered lists
    const filteredMarcas = marcasDeLetra.filter(m => m.toLowerCase().includes(searchMarca.toLowerCase()));
    const filteredLineas = lineas.filter(l => l.toLowerCase().includes(searchLinea.toLowerCase()));
    const filteredTipos = tiposDeLetra.filter(t => t.toLowerCase().includes(searchTipo.toLowerCase()));

    const handleClearAllFilters = () => {
        setFilterCat("Todas");
        setFilterLetra("");
        setFilterMarca("Todas");
        setFilterLinea("Todas");
        setFilterTipo("Todos");
        setFilterTipoLetra("");
        setSearchMarca("");
        setSearch("");
    };

    // Fila Superior: Listas + Stock
    return (
        <div className="card animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Search */}
            <div className="search-wrapper">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    className="search-input"
                    type="search"
                    placeholder="Buscar por descripción, ID o marca…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Fila Superior: Listas + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <SectionLabel>Lista de Precios</SectionLabel>
                    <div style={{ display: "flex", gap: 6 }}>
                        {["Lista 1", "Lista 2", "Lista 3"].map(lista => (
                            <button
                                key={lista}
                                className={`lista-btn ${filterLista === lista ? "active" : ""}`}
                                style={filterLista === lista ? { background: accent, borderColor: accent, boxShadow: `0 3px 10px ${accent}50` } : {}}
                                onClick={() => {
                                    setFilterLista(lista);
                                    if (lista !== "Lista 1") setCondicionVenta(0);
                                }}
                            >
                                {lista}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <SectionLabel>Stock</SectionLabel>
                    <div style={{ display: "flex", gap: 5 }}>
                        {["Todos", "Con Stock", "Sin Stock"].map(s => (
                            <Pill key={s} label={s} active={filterStock === s} color={accent} onClick={() => setFilterStock(s)} />
                        ))}
                    </div>
                </div>
            </div>

            {filterLista === "Lista 1" && (
                <div className="animate-fadeIn" style={{
                    background: "rgba(52,211,153,.06)",
                    border: "1.5px solid rgba(52,211,153,.2)",
                    borderRadius: 10, padding: "12px 14px",
                }}>
                    <SectionLabel>Condición de Venta</SectionLabel>
                    <div style={{ display: "flex", gap: 6 }}>
                        {CONDICIONES_VENTA.map(c => (
                            <button
                                key={c.value}
                                className={`cond-btn ${condicionVenta === c.value ? "active" : ""}`}
                                onClick={() => {
                                    setCondicionVenta(c.value);
                                    if (c.value === 0) setCondicionExtra(0);
                                }}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Sub-condiciones anidadas */}
                    {condicionVenta > 0 && (
                        <div className="animate-fadeIn" style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(52,211,153,.3)", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>EXTRA:</div>
                            <div style={{ display: "flex", gap: 4, flex: 1 }}>
                                {[
                                    { label: 'Cta Cte', value: 0 },
                                    { label: '10% Contado', value: 10 }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setCondicionExtra(opt.value)}
                                        style={{
                                            flex: 1, padding: "5px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                            border: "1px solid", cursor: "pointer", transition: "all 0.2s",
                                            background: condicionExtra === opt.value ? "var(--accent)" : "white",
                                            color: condicionExtra === opt.value ? "white" : "var(--text-muted)",
                                            borderColor: condicionExtra === opt.value ? "var(--accent)" : "#e2e8f0"
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div>
                <SectionLabel>Categoría</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {categorias.map(c => (
                        <Pill key={c} label={c} active={filterCat === c}
                            color={CAT_COLOR[c] || "var(--accent)"}
                            emoji={filterCat === c ? CAT_EMOJI[c] : undefined}
                            onClick={() => handleCatClick(c)} />
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Marca (Ocupa todo el ancho ahora) */}
                <div style={{ width: "100%" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <SectionLabel
                            onSearchChange={filterLetra ? setSearchMarca : null}
                            searchValue={searchMarca}
                            placeholder="Buscar marca..."
                        >Marca</SectionLabel>
                        
                        {(filterCat !== "Todas" || filterMarca !== "Todas" || filterLetra !== "" || search !== "") && (
                            <button onClick={handleClearAllFilters} style={{
                                fontSize: 11, fontWeight: 600, color: "var(--red)", background: "var(--red-bg)", 
                                border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                                transition: "all 0.2s"
                            }}>
                                ✕ Limpiar Filtros
                            </button>
                        )}
                    </div>

                    {/* Contenedor del abecedario más amplio */}
                    <div style={{ 
                        display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12, 
                        background: "rgba(0,0,0,0.02)", padding: 12, borderRadius: 10,
                        border: "1px solid var(--border)", justifyContent: "center"
                    }}>
                        {ALPHABET.map(l => {
                            const hasItems = letrasConMarcas.has(l);
                            const active = filterLetra === l;
                            return (
                                <button key={l}
                                    className={`alpha-btn ${hasItems ? "has-items" : ""} ${active ? "active" : ""}`}
                                    style={{
                                        ...(active ? { background: accent, borderColor: accent } : {}),
                                        width: 32, height: 32, fontSize: 13 // Botones un poco más grandes para que ocupen bien el espacio
                                    }}
                                    onClick={() => {
                                        if (!hasItems) return;
                                        if (active) {
                                            setFilterLetra("");
                                            setFilterMarca("Todas");
                                            setSearchMarca("");
                                        } else {
                                            setFilterLetra(l);
                                            setFilterMarca("Todas");
                                            setSearchMarca("");
                                        }
                                    }}
                                >{l}</button>
                            );
                        })}
                    </div>

                    <div className="filter-scroll-box" style={{ 
                        maxHeight: 280, // Un poco más alto ya que tiene más espacio
                        background: "var(--bg-elevated)", padding: 16, borderRadius: 10,
                        border: "1px solid var(--border)"
                    }}>
                        {filterLetra ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                <Pill label="Todas" active={filterMarca === "Todas"} color={accent} onClick={() => handleMarcaClick("Todas")} />
                                {filteredMarcas.map(m => (
                                    <Pill key={m} label={m} active={filterMarca === m} color={accent} onClick={() => handleMarcaClick(m)} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", 
                                padding: "20px 0", textAlign: "center", width: "100%"
                            }}>
                                Seleccioná una letra arriba para ver las marcas disponibles
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
