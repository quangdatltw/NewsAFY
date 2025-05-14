export const fetchGoldPrice = async () => {
    try {
        const response = await fetch('http://localhost:3000/gold-price/');
        const data = await response.text();
        let goldData;

        // Try to parse as JSON first
        try {
            goldData = JSON.parse(data);
            console.log("Parsed gold data as JSON:", goldData);
            return goldData;
        } catch (jsonError) {
            console.log("Not valid JSON, trying to parse as XML...");

            // If not JSON, try to parse as XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            // Extract data with the correct structure
            goldData = {
                DataList: {
                    Data: []
                }
            };

            const items = xmlDoc.getElementsByTagName('item');

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const rowNum = i + 1;

                // Create an object with the exact property names expected by analyzeApiService
                const goldItem = {
                    "@row": rowNum.toString(),
                    [`@n_${rowNum}`]: item.getAttribute('type') || '',
                    [`@k_${rowNum}`]: item.getAttribute('karat') || '24k',
                    [`@h_${rowNum}`]: item.getAttribute('purity') || '999.9',
                    [`@pb_${rowNum}`]: item.getAttribute('buy') || '0',
                    [`@ps_${rowNum}`]: item.getAttribute('sell') || '0',
                    [`@pt_${rowNum}`]: "0", // Add price type
                    [`@d_${rowNum}`]: item.getAttribute('updated') || new Date().toLocaleString('vi-VN')
                };

                goldData.DataList.Data.push(goldItem);
            }
        }

        console.log("Processed gold data:", goldData);
        return goldData;
    } catch (error) {
        console.error("Error fetching gold price data:", error);
        // Return a minimal valid structure with all required gold types
        return {
            DataList: {
                Data: [
                    {
                        "@row": "1",
                        "@n_1": "VÀNG MIẾNG SJC",
                        "@k_1": "24k",
                        "@h_1": "999.9",
                        "@pb_1": "0",
                        "@ps_1": "0",
                        "@pt_1": "0",
                        "@d_1": new Date().toLocaleString('vi-VN')
                    },
                    {
                        "@row": "2",
                        "@n_2": "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9",
                        "@k_2": "24k",
                        "@h_2": "99.9",
                        "@pb_2": "0",
                        "@ps_2": "0",
                        "@pt_2": "0",
                        "@d_2": new Date().toLocaleString('vi-VN')
                    },
                    {
                        "@row": "3",
                        "@n_3": "VÀNG MIẾNG VRTL",
                        "@k_3": "24k",
                        "@h_3": "999.9",
                        "@pb_3": "0",
                        "@ps_3": "0",
                        "@pt_3": "0",
                        "@d_3": new Date().toLocaleString('vi-VN')
                    }
                ]
            }
        };
    }
};