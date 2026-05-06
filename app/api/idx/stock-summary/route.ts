import { NextResponse } from "next/server";

export async function GET() {
  try {
    let lastStatus = 0;
    let lastError = "";

      try {
        // Use the exact endpoint provided by the user
        const url = `https://www.idx.co.id/primary/TradingSummary/GetStockSummary`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json, text/plain, */*',
            'referer': 'https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham/',
            'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          // Check for data in any common wrapper (Data, data, results)
          const data = result.Data || result.data || result.results || (Array.isArray(result) ? result : null);
          
          if (data && data.length > 0) {
            return NextResponse.json(result);
          }
        }
        
        lastStatus = response.status;
      } catch (err: any) {
        lastError = err.message;        
      }
    

    // If we get here, all dates failed
    throw new Error(`IDX API blocked request (Status: ${lastStatus || 'Unknown'}). ${lastError}`);
  } catch (error: any) {
    console.error("IDX Proxy Error:", error);
    return NextResponse.json(
      { error: "Access Denied by IDX", details: error.message },
      { status: 403 }
    );
  }
}
