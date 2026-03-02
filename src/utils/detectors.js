export const detectCategoria = (desc, marca) => {
    const d = desc.toUpperCase(), m = (marca || "").toUpperCase();
    if (m.includes("WAHL") || d.includes("MAQUINA") || d.includes("CLIPPER") || d.includes("TRIMMER") || d.includes("BARBER")) return "Barbería";
    if (d.includes("ESMALTE") || d.includes("NAIL") || d.includes("CUTICU") || d.includes("UÑAS") || d.includes("REMOVEDOR DE ESMALTE")) return "Manos y uñas";
    if (d.includes("BASE ") || d.includes("LABIAL") || d.includes("DELINEA") || d.includes("CORREC") || d.includes("POLVO COMPACTO") || d.includes("RIMEL") || d.includes("MASCARA DE PESTAÑAS") || d.includes("MAQUILLA")) return "Maquillaje";
    if (d.includes("CEJA") || d.includes("PESTAÑA") || d.includes("BROW") || d.includes("LASH")) return "Cejas y pestañas";
    if (d.includes("SERUM FACIAL") || d.includes("CREMA FACIAL") || d.includes("CONTORNO DE OJOS") || d.includes("IDRAET") || d.includes("VITAMINA C") || d.includes("RETINOL") || d.includes("DERMOCOSME") || d.includes("DESMAQUIL")) return "Dermocosmética";
    if (d.includes("PERFUM") || d.includes("EAU DE") || d.includes("COLONIA") || d.includes("FRAGRANC")) return "Perfumería";
    if (d.includes("CEPILLO") || d.includes("PEINE") || d.includes("PINZA") || d.includes("VINCHA") || d.includes("GOMA") || d.includes("CLIP PARA CABELLO") || d.includes("ACCESORIO")) return "Accesorios";
    if (d.includes("PLANCHA") || d.includes("SECADOR") || d.includes("RIZADOR") || d.includes("DIFUSOR") || d.includes("HERRAMIENTA")) return "Herramientas";
    return "Capilar";
};

export const detectLinea = (desc) => {
    const d = desc.toUpperCase();
    if (d.includes("MOLECULAR")) return "Absolut Repair Molecular";
    if (d.includes("AB.R") || d.includes("ABSOLUT REPAIR") || d.includes("ABSOLUT R")) return "Absolut Repair";
    if (d.includes("V.COLOR") || d.includes("VITAMINO COLOR") || d.includes("V. COLOR")) return "Vitamino Color";
    if (d.includes("METAL DETOX")) return "Metal Detox";
    if (d.includes("PRO-LONGER") || d.includes("PRO LONGER")) return "Pro-Longer";
    if (d.includes("CURLS")) return "Curls Expression";
    if (d.includes("SCALP")) return "Scalp";
    if (d.includes("SILVER")) return "Silver";
    if (d.includes("DULCIA")) return "Dulcia";
    if (d.includes("LOLA")) return "Lola";
    if (d.includes("REVLON")) return "Revlon";
    if (d.includes("WAHL")) return "Wahl";
    if (d.includes("BONMETIQUE")) return "Bonmetique";
    return "General";
};

export const detectTipo = (desc) => {
    const d = desc.toUpperCase();
    if (d.includes("SH.") || d.includes("SHAMPOO") || d.includes("CHAMPU")) return "Shampoo";
    if (d.includes("CR.ENJ") || d.includes("ACOND") || d.includes("ACON ") || d.includes("ENJUAGUE")) return "Acondicionador";
    if (d.includes("MASC") || d.includes("MASQ")) return "Máscara";
    if (d.includes("SERUM")) return "Serum";
    if (d.includes("SPRAY")) return "Spray";
    if (d.includes("MOUSSE")) return "Mousse";
    if (d.includes("CREMA PEINAR") || d.includes("CREMA PE")) return "Crema Peinar";
    if (d.includes("PRE-TRAT") || d.includes("PRE TRAT")) return "Pre-Tratamiento";
    if (d.includes("OIL") || d.includes("ACEITE")) return "Aceite";
    if (d.includes("TONICA") || d.includes("PERM") || d.includes("TINTE") || d.includes("COLOR")) return "Color";
    return "Otro";
};

export const normalizeCategoria = (csvCat, desc, marca) => {
    if (!csvCat) return detectCategoria(desc, marca);
    const c = csvCat.toUpperCase().trim();
    if (c.includes("MAQUILLA")) return "Maquillaje";
    if (c.includes("CAPILAR")) return "Capilar";
    if (c.includes("MANOS") || c.includes("UÑAS")) return "Manos y uñas";
    if (c.includes("FRAGANCIA") || c.includes("PERFUME")) return "Fragancias";
    if (c.includes("CUIDADO PERSONAL")) return "Cuidado Personal";
    if (c.includes("DERMO")) return "Dermocosmética";
    if (c.includes("BARBER")) return "Barbería";
    if (c.includes("HERRAMIENTA")) return "Herramientas";
    if (c.includes("CEJA") || c.includes("PESTAÑA")) return "Cejas y pestañas";
    if (c.includes("ARTICULO")) return "Artículos";
    if (c.includes("NO REPONE")) return "No Repone";
    return detectCategoria(desc, marca); // Fallback al detector por texto
};

export const normalizeTipo = (csvTipo, desc) => {
    if (!csvTipo) return detectTipo(desc);
    // Podemos usar el valor del CSV directamente o normalizarlo si es muy ruidoso
    // Por ahora, si viene del CSV, lo usamos capitalizado
    const t = csvTipo.trim();
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

export const enrich = (p) => {
    const categoria = normalizeCategoria(p.csvCat, p.desc, p.marca);
    const tipo = normalizeTipo(p.csvTipo, p.desc);
    const linea = detectLinea(p.desc);

    return {
        ...p,
        categoria,
        linea,
        tipo,
    };
};
