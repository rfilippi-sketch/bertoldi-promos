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

    // Filtered lists
    const filteredMarcas = marcasDeLetra.filter(m => m.toLowerCase().includes(searchMarca.toLowerCase()));
    const filteredLineas = lineas.filter(l => l.toLowerCase().includes(searchLinea.toLowerCase()));
    const filteredTipos = tiposDeLetra.filter(t => t.toLowerCase().includes(searchTipo.toLowerCase()));

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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                {/* Lista de precios */}
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

                {/* Stock */}
                <div>
                    <SectionLabel>Stock</SectionLabel>
                    <div style={{ display: "flex", gap: 5 }}>
                        {["Todos", "Con Stock", "Sin Stock"].map(s => (
                            <Pill key={s} label={s} active={filterStock === s} color={accent} onClick={() => setFilterStock(s)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Condición de Venta — solo para Lista 1 */}
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
                                onClick={() => setCondicionVenta(c.value)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    {condicionVenta > 0 && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "var(--green)", fontWeight: 500 }}>
                            💡 Se aplica <strong>{condicionVenta}%</strong> de descuento adicional a Lista 1.
                        </div>
                    )}
                </div>
            )}

            {/* Categoría */}
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

            {/* Marca (A-Z) + Línea + Tipo */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.5fr", gap: 14 }}>
                {/* Marca */}
                <div>
                    <SectionLabel
                        onSearchChange={filterLetra ? setSearchMarca : null}
                        searchValue={searchMarca}
                        placeholder="Filtrar marca..."
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
                                <Pill label="Todas" active={filterMarca === "Todas"} color={accent} onClick={() => setFilterMarca("Todas")} />
                                {filteredMarcas.map(m => (
                                    <Pill key={m} label={m} active={filterMarca === m} color={accent} onClick={() => setFilterMarca(m)} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>
                                Seleccioná una letra
                            </div>
                        )}
                    </div>
                </div>

                {/* Línea */}
                <div>
                    <SectionLabel
                        onSearchChange={lineas.length > 5 ? setSearchLinea : null}
                        searchValue={searchLinea}
                        placeholder="Filtrar línea..."
                    >Línea</SectionLabel>
                    <div className="filter-scroll-box">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                            {filteredLineas.map(l => (
                                <Pill key={l} label={l} active={filterLinea === l} color={accent} onClick={() => setFilterLinea(l)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tipo */}
                <div>
                    <SectionLabel
                        onSearchChange={filterTipoLetra ? setSearchTipo : null}
                        searchValue={searchTipo}
                        placeholder="Filtrar tipo..."
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

                    <div className="filter-scroll-box">
                        {filterTipoLetra ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                <Pill label="Todos" active={filterTipo === "Todos"} color={accent} onClick={() => setFilterTipo("Todos")} />
                                {filteredTipos.map(t => (
                                    <Pill key={t} label={t} active={filterTipo === t} color={accent} onClick={() => setFilterTipo(t)} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>
                                Seleccioná una letra
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
