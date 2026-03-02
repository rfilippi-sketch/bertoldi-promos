const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qaoxyyihkcchwyhuduwp.supabase.co';
const supabaseAnonKey = 'sb_publishable_Kn_3i19_EtlCocbjLEakxw_Vlde5KLz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    console.log("Starting paginated fetch...");
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        console.log(`Fetching page ${page} (range ${page * pageSize} to ${(page + 1) * pageSize - 1})...`);
        const { data, error } = await supabase
            .from('productos')
            .select('id')
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('id', { ascending: true });

        if (error) {
            console.error("Error on page", page, error);
            break;
        }

        console.log(`Received ${data.length} rows.`);

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            if (data.length < pageSize) {
                console.log("Less than pageSize, stopping.");
                hasMore = false;
            }
            page++;
        } else {
            console.log("No data returned, stopping.");
            hasMore = false;
        }
    }

    console.log("Total fetched:", allData.length);
}

testFetch();
