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

    // Detección automática de separador robusta
    const sample = lines.slice(0, 5).join("\n");
    const counts = {
        ";": (sample.match(/;/g) || []).length,
        "\t": (sample.match(/\t/g) || []).length,
        ",": (sample.match(/,/g) || []).length
    };

    // Elegir el que más aparezca, dando prioridad a ; y \t sobre , 
    // porque , se usa frecuentemente como decimal en AR.
    let sep = ",";
    if (counts[";"] > counts["\t"] && counts[";"] > counts[","]) sep = ";";
    else if (counts["\t"] > counts[";"] && counts["\t"] > counts[","]) sep = "\t";
    else if (counts[";"] > 0) sep = ";"; // Si hay algún punto y coma, probablemente sea ese

    const splitLine = (line) => {
        if (!line) return [];
        // Si hay comillas, usar un split más complejo. Si no, split simple.
        if (line.includes('"')) {
            const result = [];
            let current = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') inQuotes = !inQuotes;
                else if (char === sep && !inQuotes) {
                    result.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result.map(c => c.replace(/^"(.*)"$/, "$1"));
        }
        return line.split(sep).map(c => c.trim());
    };

    const headers = splitLine(lines[0]).map(h =>
        h.toLowerCase().replace(/[\s$]/g, "_").replace(/[^a-z0-9_]/g, "")
    );

    const findCol = (aliases) => {
        for (const a of aliases) {
            const i = headers.findIndex(h => h === a || h.includes(a));
            if (i >= 0) return i;
        }
        return -1;
    };

    const cols = {
        id: findCol(["id"]),
        desc: findCol(["descripcion"]),
        marca: findCol(["marca"]),
        stock: findCol(["cant"]),
        costo: findCol(["costo_final_$"]),
        precio1: findCol(["lista_1$"]),
        precio2: findCol(["lista_2$"]),
        precio3: findCol(["lista_3$"]),
        dpto: findCol(["dpto", "departamento"]),
        fam: findCol(["fam", "familia"]),
    };

    return lines.slice(1).map(line => {
        const cells = splitLine(line);
        const get = i => (i >= 0 && i < cells.length) ? cells[i] : "";

        const id = parseInt(get(cols.id)) || 0;
        const desc = get(cols.desc);
        const marca = get(cols.marca) || "SIN MARCA";

        if (!id || !desc) return null;
        if (ignorarProducto(desc, marca)) return null;

        // Si detectamos que las celdas se desfasaron (ej: dpto tiene un número), 
        // es probable que la coma decimal rompió el split.
        // Pero vamos a intentar limpiar los datos primero.

        return {
            id,
            desc,
            marca,
            stock: parseNum(get(cols.stock)),
            costo: parseNum(get(cols.costo)),
            precio1: parseNum(get(cols.precio1)),
            precio2: findCol(["lista_2"]) >= 0 ? parseNum(get(cols.precio2)) : parseNum(get(cols.precio3)),
            precio3: parseNum(get(cols.precio3)),
            csvCat: get(cols.dpto),
            csvTipo: get(cols.fam),
        };
    }).filter(Boolean);
};
