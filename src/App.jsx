import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import { usePromoState } from './hooks/usePromoState.js';
import { CAT_COLOR } from './constants/categories.js';
import Header from './components/Header.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import ProductList from './components/ProductList.jsx';
import BundlePanel from './components/BundlePanel.jsx';
import DiscountPanel from './components/DiscountPanel.jsx';

const SESSION_KEY = 'bertoldi_user';

export default function BertoldiPromo() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // If not logged in, show login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AppContent user={user} onLogout={handleLogout} />;
}

function AppContent({ user, onLogout }) {
  const state = usePromoState();
  const accent = CAT_COLOR[state.filterCat] || 'var(--accent)';
  const isAdmin = user.role === 'admin';

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      <Header
        productos={state.productos}
        storageStatus={state.storageStatus}
        storageInfo={state.storageInfo}
        filterCat={state.filterCat}
        importing={state.importing}
        csvMsg={state.csvMsg}
        fileRef={state.fileRef}
        handleCSV={state.handleCSV}
        user={user}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 20px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Tabs + actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={`tab-btn ${state.tab === 'bundle' ? 'active' : ''}`} onClick={() => state.setTab('bundle')}>
              🎁 Bundle
            </button>
            <button className={`tab-btn ${state.tab === 'descuento' ? 'active' : ''}`} onClick={() => state.setTab('descuento')}>
              🏷️ Descuento Individual
            </button>
            <div style={{ flex: 1 }} />
            {state.filtered.length > 0 && (
              <button className="btn-action" onClick={state.selectAll} style={{ fontSize: 11 }}>
                Agregar todos ({state.filtered.length.toLocaleString('es-AR')})
              </button>
            )}
            {state.selectedIds.length > 0 && (
              <button className="btn-action danger" onClick={state.clearAll} style={{ fontSize: 11 }}>
                ✕ Limpiar selección ({state.selectedIds.length})
              </button>
            )}
          </div>

          {/* Filters */}
          <FilterPanel
            filterCat={state.filterCat} setFilterCat={state.setFilterCat}
            filterLetra={state.filterLetra} setFilterLetra={state.setFilterLetra}
            filterMarca={state.filterMarca} setFilterMarca={state.setFilterMarca}
            filterLinea={state.filterLinea} setFilterLinea={state.setFilterLinea}
            filterTipo={state.filterTipo} setFilterTipo={state.setFilterTipo}
            filterTipoLetra={state.filterTipoLetra} setFilterTipoLetra={state.setFilterTipoLetra}
            filterStock={state.filterStock} setFilterStock={state.setFilterStock}
            filterLista={state.filterLista} setFilterLista={state.setFilterLista}
            condicionVenta={state.condicionVenta} setCondicionVenta={state.setCondicionVenta}
            search={state.search} setSearch={state.setSearch}
            categorias={state.categorias}
            ALPHABET={state.ALPHABET}
            letrasConMarcas={state.letrasConMarcas}
            marcasDeLetra={state.marcasDeLetra}
            lineas={state.lineas}
            tipos={state.tipos}
            letrasConTipos={state.letrasConTipos}
            tiposDeLetra={state.tiposDeLetra}
          />

          {/* Product list */}
          <ProductList
            filtered={state.filtered}
            selectedIds={state.selectedIds}
            tab={state.tab}
            productDiscounts={state.productDiscounts}
            setProductDiscounts={state.setProductDiscounts}
            toggleSelect={state.toggleSelect}
            filterCat={state.filterCat}
            getPrecio={state.getPrecio}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 76, alignSelf: 'start', maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
          {state.tab === 'bundle' && (
            <BundlePanel
              selectedProducts={state.selectedProducts}
              bundleCalc={state.bundleCalc}
              bundleDiscount={state.bundleDiscount} setBundleDiscount={state.setBundleDiscount}
              bundleProductDiscounts={state.bundleProductDiscounts} setBundleProductDiscounts={state.setBundleProductDiscounts}
              hasIndivBundleDisc={state.hasIndivBundleDisc}
              sliderLocked={state.sliderLocked} inputsLocked={state.inputsLocked}
              resetBundleMode={state.resetBundleMode}
              toggleSelect={state.toggleSelect}
              filterCat={state.filterCat}
              condicionVenta={state.condicionVenta}
              getPrecio={state.getPrecio}
            />
          )}
          {state.tab === 'descuento' && (
            <DiscountPanel
              discountedProducts={state.discountedProducts}
              toggleSelect={state.toggleSelect}
              filterCat={state.filterCat}
              condicionVenta={state.condicionVenta}
            />
          )}
        </div>
      </div>
    </div>
  );
}
