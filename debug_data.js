const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qaoxyyihkcchwyhuduwp.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kn_3i19_EtlCocbjLEakxw_Vlde5KLz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStock() {
    console.log("--- Checking Loreal Stock ---");
    const { data, error } = await supabase
        .from('productos')
        .select('marca, stock')
        .ilike('marca', '%LOREAL%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data.length === 0) {
        console.log("No Loreal products found.");
        return;
    }

    const total = data.length;
    const withStock = data.filter(p => p.stock > 0).length;
    const withoutStock = total - withStock;

    console.log(`Loreal SKUs: ${total}`);
    console.log(`With Stock: ${withStock}`);
    console.log(`Without Stock: ${withoutStock}`);

    if (total > 0) {
        console.log("Sample stock values:", data.slice(0, 5).map(p => p.stock));
    }
}

checkStock();
