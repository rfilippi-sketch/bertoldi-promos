const MARCAS_IGNORAR = new Set([
    "PERFUMERIA", "ZZ", "Z", "- NINGÚN FABRICANTE -", "- NINGúN FABRICANTE -",
    "- NINGÃºN FABRICANTE -", "- NINGãºN FABRICANTE -", "ACCESORIOS", "ACCME",
    "ZDE", "ZTAYLOR",
    "PELUCA", "PERF", "THELMALOUISE", "SUETER", "TAROPIO", "AUTIE", "ACUARELA",
    "BAIRES AR", "BEAUTY", "BEURER", "BLACK", "B-WAY", "CAREST", "CERIOTTI",
    "CITY GIRL", "CLEANBRUSH", "CONTI", "CRAFTMEN", "CREMBEL", "DANDY",
    "DESCARTABLE", "DONBEARD", "ELECTROMED", "ELEGANCE**", "ESENCIA", "FIGO",
    "FLEJIE(M)", "FLEXAFIL", "FREEMAN", "G.SALONM", "GALVAN", "GAO", "GENNUINE",
    "GRADOM", "HAIRTHERAPY", "HAWAIIAN", "HOMEDICS", "IBD", "INDUMENTA", "JEAN",
    "KONJACCOONY", "LABOR", "LAUTIN", "LEYDA", "LIS", "MADEROTERAPIA", "MEGATEN",
    "MELANIA", "MELODI", "MERCHANDISING", "MILANO", "MODALITE", "MOROCCANOIL",
    "NAILS&CO", "NANY", "NOVAL", "OPTION", "PAITER", "PHITOPLASMA", "PINK",
    "POLIMEC", "PRAKTICA", "PRODUCTOSNITY", "RING", "ROYAL", "SARAC", "SERVICIOS",
    "SETA", "SIMONETTI", "STARBENE", "TAROPPIO(M)", "TRES CLAVELES **", "TRU",
    "VALERA", "VANTA", "VICTORIA", "WELLA",
]);

const ignorarProducto = (desc, marca) => {
    if (MARCAS_IGNORAR.has((marca || "").trim().toUpperCase())) return true;
    const upperDesc = (desc || "").toUpperCase();
    if (upperDesc.includes("(I)")) return true;
    if (upperDesc.includes("DISCONTINUO")) return true;
    if (upperDesc.includes("NO REPONE")) return true;
    if (upperDesc.includes("(NR)")) return true;
    if (upperDesc.includes("( NR )")) return true;
    return false;
};

const parseNum = s => {
    if (!s) return 0;
    const clean = s.trim().replace(/[$\s]/g, "");
    if (!clean) return 0;
    // Formato argentino: punto = miles, coma = decimal
    if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(clean) || /^\d+(,\d+)?$/.test(clean)) {
        return parseFloat(clean.replace(/\./g, "").replace(",", ".")) || 0;
    }
    // Formato US
    if (/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(clean)) {
        return parseFloat(clean.replace(/,/g, "")) || 0;
    }
    return parseFloat(clean) || 0;
};

/**
 * Parsea un CSV/TSV y retorna productos con soporte para 3 listas de precio.
 * Columnas de precio detectadas:
 *   Lista 1: lista_1, lista1, l1, precio1
 *   Lista 2: lista_2, lista2, l2, precio2
 *   Lista 3: lista_3, lista3, l3, precio (default actual)
 */
export const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const sep = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(sep).map(h =>
        h.trim().toLowerCase().replace(/[\s$]/g, "_").replace(/[^a-z0-9_]/g, "")
    );

    const findCol = (aliases) => {
        for (const a of aliases) {
            const i = headers.findIndex(h => h.includes(a));
            if (i >= 0) return i;
        }
        return -1;
    };

    const cols = {
        id: findCol(["id", "codigo", "cod", "sku"]),
        desc: findCol(["descripcion", "desc", "nombre", "articulo", "art"]),
        marca: findCol(["marca", "brand", "fabricante", "fab", "prov", "fba"]),
        stock: findCol(["cant", "stock", "cantidad", "disponible"]),
        costo: findCol(["costo_final", "costo", "cost"]),
        precio1: findCol(["lista_1", "lista1", "l1", "precio1"]),
        precio2: findCol(["lista_2", "lista2", "l2", "precio2"]),
        precio3: findCol(["lista_3", "lista3", "l3", "precio"]),
        dpto: findCol(["dpto", "departamento", "categoria", "seccion"]),
        fam: findCol(["fam", "familia", "tipo", "rubro"]),
    };

    // Si algo no se encontró, intentar fallback: el primer precio que exista
    // es precio3 (comportamiento original), y precio1/precio2 = 0
    return lines.slice(1).map(line => {
        const cells = line.split(sep).map(c => c.trim().replace(/^"(.*)"$/, "$1"));
        const get = i => (i >= 0 && i < cells.length) ? cells[i] : "";
        const id = parseInt(get(cols.id)) || 0;
        const desc = get(cols.desc);
        const marca = get(cols.marca) || "SIN MARCA";
        if (!id || !desc) return null;
        if (ignorarProducto(desc, marca)) return null;

        const precio3 = parseNum(get(cols.precio3));
        const precio1 = cols.precio1 >= 0 ? parseNum(get(cols.precio1)) : precio3;
        const precio2 = cols.precio2 >= 0 ? parseNum(get(cols.precio2)) : precio3;

        return {
            id,
            desc,
            marca,
            stock: parseNum(get(cols.stock)),
            costo: parseNum(get(cols.costo)),
            precio1,
            precio2,
            precio3,
            csvCat: get(cols.dpto), // Categoría cruda del CSV
            csvTipo: get(cols.fam),  // Tipo crudo del CSV
            // precio activo será determinado por la lista seleccionada en el hook
        };
    }).filter(Boolean);
};
