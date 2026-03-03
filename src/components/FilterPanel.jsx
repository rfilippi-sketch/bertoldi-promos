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

    // Marca (A-Z) + Línea + Tipo
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                {/* Marca */}
                <div style={{ minWidth: 0 }}>
                    <SectionLabel
                        onSearchChange={filterLetra ? setSearchMarca : null}
                        searchValue={searchMarca}
                        placeholder="Buscar marca..."
                    >Marca</SectionLabel>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 7 }}>
                        {ALPHABET.map(l => {
                            const hasItems = letrasConMarcas.has(l);
                            const active = filterLetra === l;
                            return (
                                <button key={l}
                                    className={`alpha-btn ${hasItems ? "has-items" : ""} ${active ? "active" : ""}`}
                                    style={active ? { background: accent, borderColor: accent } : {}}
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

                    <div className="filter-scroll-box">
                        {filterLetra ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                <Pill label="Todas" active={filterMarca === "Todas"} color={accent} onClick={() => handleMarcaClick("Todas")} />
                                {filteredMarcas.map(m => (
                                    <Pill key={m} label={m} active={filterMarca === m} color={accent} onClick={() => handleMarcaClick(m)} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>Seleccioná una letra</div>
                        )}
                    </div>
                </div>

                {/* Línea */}
                <div style={{ minWidth: 0 }}>
                    <SectionLabel
                        onSearchChange={lineas.length > 5 ? setSearchLinea : null}
                        searchValue={searchLinea}
                        placeholder="Buscar línea..."
                    >Línea</SectionLabel>
                    <div className="filter-scroll-box" style={{ maxHeight: 220 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                            {filteredLineas.map(l => (
                                <Pill key={l} label={l} active={filterLinea === l} color={accent} onClick={() => setFilterLinea(l)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tipo */}
                <div style={{ minWidth: 0 }}>
                    <SectionLabel
                        onSearchChange={filterTipoLetra ? setSearchTipo : null}
                        searchValue={searchTipo}
                        placeholder="Buscar tipo..."
                    >Tipo de Producto</SectionLabel>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 7 }}>
                        {ALPHABET.map(l => {
                            const hasItems = letrasConTipos.has(l);
                            const active = filterTipoLetra === l;
                            return (
                                <button key={l}
                                    className={`alpha-btn ${hasItems ? "has-items" : ""} ${active ? "active" : ""}`}
                                    style={active ? { background: accent, borderColor: accent } : {}}
                                    onClick={() => {
                                        if (!hasItems) return;
                                        if (active) {
                                            setFilterTipoLetra("");
                                            setFilterTipo("Todos");
                                            setSearchTipo("");
                                        } else {
                                            setFilterTipoLetra(l);
                                            setFilterTipo("Todos");
                                            setSearchTipo("");
                                        }
                                    }}
                                >{l}</button>
                            );
                        })}
                    </div>

                    <div className="filter-scroll-box" style={{ maxHeight: 180 }}>
                        {filterTipoLetra ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                <Pill label="Todos" active={filterTipo === "Todos"} color={accent} onClick={() => setFilterTipo("Todos")} />
                                {filteredTipos.map(t => (
                                    <Pill key={t} label={t} active={filterTipo === t} color={accent} onClick={() => setFilterTipo(t)} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>Seleccioná una letra</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
