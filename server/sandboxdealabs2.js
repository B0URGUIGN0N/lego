const fs = require('fs');
//const fetch = require('node-fetch');
const dealabs = require('./websites/dealabs'); // Your Dealabs scraper

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  Browsing ${website} website`);

    // Scrape deals and extract set ids from Dealabs.
    const deals = await dealabs.scrape(website);
    console.log('Dealabs deals:', deals);

    // Save scraped deals to deals.json for inspection.
    fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2), 'utf-8');
    console.log('Saved the deals into deals.json');

    // Array to hold the Vinted API results.
    const vintedResults = [];

    // Loop over the deals that have a valid set id.
    for (const deal of deals) {
      if (deal.setId && deal.setId !== 'Error') {
        // Build the search text and the API URL.
        const searchText = encodeURIComponent(deal.setId);
        // Use the provided timestamp from your example.
        const timestamp = '1741011459';
        const apiUrl = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1741612243&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=&color_ids=&material_ids=`;

        console.log(`Fetching Vinted API for set id ${deal.setId} => ${apiUrl}`);

        // Call the API using the provided headers.
        const response = await fetch(apiUrl, {
          credentials: "include",
          method: "GET",
          mode: "cors",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
            "Content-Type": "application/json",
            
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "fr",
            "X-Anon-Id": "489ab767-1ff9-4b5c-9aa2-8fa5aea807c2",
            "X-CSRF-Token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "If-None-Match": 'W/"9479a980be81f56cc93b245db3651bdd"',
            "Cookie" : "v_udt=YzJ5VndwOGFxeml1VmxkUjlzcnJPZXNPM1FiTC0tdkhJczBXUVF6SmdKc05lLy0teDl6QWVIcjZYWXZHNW40VE01SUQzQT09; anonymous-locale=fr; anon_id=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2; cf_clearance=yltj7yvpNwOpskikbpnXvR.jGON2jzXFXZmDxsfp3SU-1742216639-1.2.1.1-9c.bG8f5Mni_u7rwpVTspFt_neTGq4sqgIJPVivxOU228i1ZBHQaQKjRvZwF7RbKM6CLajONtJyrdVwwgDAUgrWXogJh53a.l47zmksLFUMCxNRKhST.YsTtrZop96AkjF3OMxxEokefNfkGIWtNstIsusNzigcMdwPH.7Hor0AuR6.b5iY.F6Glz4_D8wD4zK7LiQC7ZzTfjxkTBxYbY1lCZJ8feLb.ZlGok47oi6hrLMysjVfXVSUoyqB1VqBVOFLcrosdWy4baEZzgNrkKYYYWJsZKv7xAxjcj0YrRK0z0LEup8R2JLz9izzMEAKKyWD7YLoB2som81YbZAD9L_qv3vEKOtUzd4_r7yvwCWg; v_sid=3d746214-1741006625; _vinted_fr_session=TlRBaGhYdWc0VWFlcnE5cVBmQTNuVy91bDJSZElQajR1MExqenNJdXUxbFlqaEpvWHhQS2IzQlE5TUNQSnN2alA1OXAyNW9mTFBHM0c3aEtHbjhxTVJxcXcrTTdFbC84aW1xejVTUnlid01mcGRpb2xwaU1yUHlXc0cyUzJjMXNyc2lPRk14WVlOWllDdEttUld2UTVCVUdyNE9pU1kwcCtlZGJvVExSdUxWSVJ2MEhmRGt4M1VicDhJdkcxYzdBVXlOU1RDNHNoWlg0QkNaUm1UQk9Sa1E4T0NyNjhaQzlla2MyVmx0ZHFSYXkyeTZkMkQ1dis2REprdnNtNmxBWjhJR2YxNlI4U2lqME56Z3oyQ20wSUNUdWpPb2J3UkUzMjlzR3R0M1RYMlBLcmJ2OGt2K1p0aDVrcllYWlFiV2x0dGdCSmppMTlOZmtJS09OdE5BT0hzQnRmTmFZdGRYT2FoajEvWjdqVm93blh0MWxwaDA5WXJ5Rk9KaSs3UkRyUWptL2dKVUdva0dOemtzMjRPLzNTWllGakNQOWlQVm0rVDBsRC84aFZQUjR4YUhzNVFzQkZ4MnI0ay9BWHFzcDVoRGpxS3FzSWJObGNTZlo2cWZhSkFRT0pzU0R2N2psbnRRUGlZdzRaeEhIdjVHamRCYktFVmQvWVhxYngwc3ZSL3JYbmNuVW4rZnVhakhWYzZxR1M2TnhhalE0Rk1Fb1NRNTV6d3R3cjdSOFl6THBHYVdRVHlmaDNReWtVM3ZacitVRFN6R1I3NWhPUnd0OXpYdVd5R2x1OTVhTGpRMHE2U2VPdTdZUXBKdUh1SHltTlJDRXBsREVFalpCMGswQXBUdGd1blJvQ2UvU2JkQUIreVpkMUdBUXVmYWh6NVlveENqK09WR1lRRnZpa25GeWlmendGNHRQZEdwaFNzZHRwMkhwQnNsVk1Xclpkc0lhQi9iTlM1b0hrMWY5TVB2alU4QVo1bVNuOWFRbmpUUERhQmkrekFXZ093UlAvNi9lUndOK3paSHhST1BJWlRqNExFR2dBU0MwMTRqc2FTR2NrZSt6My82WHlpcFpCWnlpdlZ6VnFBTnhXK0svd3o5QTZPVUxuRDBHYy93clJvSnVJQUlINDFhRG5Vc29PbitpcG9TNnltOWFmWm5ZL0RWUlRodURHSUs4OE5jN01TSHh3blFNcDF5NktEN0N1NjNyRGJocXJCekhJM0krNy9mOXd3Qm8vWjljUkhFM0RvSjlET084elMyTXZtMDZxVk5Cbi9aYmwyM0VCVXUrRE5pajlnSEVXZmVTbmw5bGdrUjk5eDFzTjdyTnlJa0taQnhTTnpzYjc1S1FyNE85WGVpd1RWMzVJYkdqNkdXQStwTCs2Nm1Xa1dZNkNwYlJGSDJSZ2NPNnVzZXJJaEZzSCsrNDVqYWtGRVE4OWpFMis0Ujk0N2N5QlNUR2RSbFBUTjhwZmFEQU9CUjNkZE5iQzlIZWErcjFYdHFDaHJxai96ZVd1WFpZUDdtSlllZDA0VTJ3V3I4eUNNK0crQkJrT1hvbkhrdXR5azA4NG1vRXpGT016MGNGdTk0WG5FSkttNTFndHFNd3NKNVJxRXd3cy85aS9rSW1OejZzWHdOem96YVNmTVgzZmpPeE8vZVloWms3WnVVRmFWSmxHS3RteisvUzUvcVRERXJscytUZ2g0Y0s4OFdMNWRwQ3lwNFp3YUVxMzR1bklrYUJtLzk3TU93bk12VlVHWFVHbHlCZHJ6aHFLd0F3Qi9mTkpPZEZnSDdvWnNRY3ZRL0RPL3ZtZVdxd2ppUElaTkFKN1dMWTFETW5MUTlFQTRYbmJhTWozM0FPaTI2YnRPV2RSRUZlTzRkeFQ5QnVjUDFSVHZodTA3MG9zeVJ5azlXbk9JYjN1Q1hiRFk1alQrdXlqYVU2a2VYQ3p3cXMzRGpHU3R5dFVES3BUUzNnVWxiRWxJaUNScElkRmRjeDAvalduWTVGWHFzZXEvV1FOb1hlZCt2encxbmJ1NUNlZWpMSUJLSGR6US9rY2pXOGoxZ1pUd2JmQTFhVWRGaFc1NSs3MGpYd3NGejFCSmg4WUE3TUw1Z0VSWWNUNkg0OTcyR3pzKzR2VzZobUxKR2MwWUcyVzFndjFEeUFjTEVGdXhLZVo2RWFGb1hIb1hkc0pDWU5UVU4yZXgrZlo1blRmQlhxY244ZGQrbjA0YVJUUTdmWW9HeUhNMFR1WWlJYXgvQ3lGOW4rNmhZeC9aZ1ZpSlFIQ1pnSXJGOVg2bU5scUcvQnhNKzRTUTUrbXp4NnpBdUs4ZHRpNDFGZDMzRW9yeXZYUSsrbWV3UFJhd3NDa25Ya251WEdNRU9neHBjVjNWa2hoQm52NFZjMC0tcHZDc1RhVCtkMXNNTzhRTlpQUnRkZz09--91ac272b8ebe761a3fee45bd31755fd859cccf99; datadome=hXcSXfLJiembKH1SSPt1a4Nwu7YBNHOWu1aVhbtuHxE1f59qiVqrBho4TuSj7mik4mViTEHEfqSUltwsCoSH8BGRpa4gHYW4ZQmFRjhBuru6AxZ5PnCic_OGzcfzeaZV; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+17+2025+14%3A04%3A18+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2&interactionCount=24&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3B; domain_selected=true; OptanonAlertBoxClosed=2025-03-03T12:57:13.648Z; eupubconsent-v2=CQNsN1gQNsN1gAcABBENBfFgAAAAAAAAAChQAAAAAAFhIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAXgAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A8oB8QD7YH7AfuBA8CCIEGAINgQrHQSgAFwAUABUADgAIAAXQAyADUAHgARAAmABVgC4ALoAYgA3gB6AD9AIYAiQBLACaAFGAK0AYYAygBogDZAHeAPaAfYB-wEUARgAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABMABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B5QD4gH7AQPAgwBBsCFZCA4AAsACgALgAqgBcADEAG8APQAjgB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRgAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeApsBYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbAALgAoACoAHAAQQAyADQAHgARAAmABVADEAH6AQwBEgCjAFaAMoAaIA2QB3wD7AP0AiwBGACggFXALmAXkAxQBtADcAIdAReAkQBOwChwFNgLFAWwAuABcgC7QF5gL6AYaAyQBk8DLAMuAZzA1gDWQG3gN1AcmA8cB7QEIQIWlAEAAFwASACOAHOAO4AgABIgCxAGvAO2Af8BHoCRQExAJtAUgAp8BXYC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWWgAgKbAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; __cf_bm=Y3e0pEHUiHi7W2ugqJMrm6PkBaSs5bst02Je1_Mlb6o-1742216600-1.0.1.1-x7dvkrtl4Q_eDZPGGclKdqaCr3jftkQlkT1zevC0g6rGFo4oHdYLhqDFUsT62W9PcMQjz.xAf6r.kKlbCi1LvsW4_oopf2JFFbdIGf74wAL8VDZGPh0OL0yYaedft8Ys; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyMjE2NjMyLCJzaWQiOiI3MDY3Njg3My0xNzQyMjE2NjMyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMjM4MzIsInB1cnBvc2UiOiJhY2Nlc3MifQ.L5-T10xkRUOOMJV-UOOCkHfDpamY_oJhQ6wJfD0Jt51x4jjKAJ4jTCe5YE4aQ2Fi6sZQn484vBSqCuDkhI04xZp61Edj4lGwcHcN464BrGo-Fc3UKcQnRf5TtxvEebM52EoauefHGwmC6Dn0g2imYyQgiYl-vAtWzQRtjPrUALSTF_Ejd0OGXTUGVi_hrH9hbVPbcbghUSyx0GkuL2BWF_TfZ2KBopeXRA8G1hFloJMy6ejR7VJ38btgzbx1ShNTI_2HH9zAQEtPfpm8Nl0eiNa8cJfbrh7ufwdsl_yLK8EWrB0VJUBGkzIb0FT6M4JLeNCxtH6vgEjibU05F3XM1w; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyMjE2NjMyLCJzaWQiOiI3MDY3Njg3My0xNzQyMjE2NjMyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDI4MjE0MzIsInB1cnBvc2UiOiJyZWZyZXNoIn0.lcERcf7w1pu1Xs1nFTacgfFxCQyfwdj87dvqry8f2ZypBVIi-Zreb9m_9elaIga7Hj3bdtsuNeXfDcqB5oHUsPcV9bD_jIx5jINj17KMUY_mStjUDIVP-NCKqw5zx-oBvVCxOaPuvsrGXVMq1-ITAJ54ItNuMop90DN9RnB-6xVGA-BATxXcSkqpiVGw0Z_XMg1sAddaw4beA4FA-_e4LdIln0J-MSmE7ih1ldIGPRK8PpWCc19GrBGi7M2_vv4SOgWihGFVa_0sy5D2NK0o83dfhjOX1Dv8ZIpuxKthLVuxcsKLXfQH1bqW5ILkY5bCcE8xteDEXtz3xN3ssgeUMg; viewport_size=1010; banners_ui_state=PENDING"
             },
          referrer: `https://www.vinted.fr/catalog?search_text=${searchText}`
        });
        

        if (!response.ok) {
          console.error(`Failed to fetch Vinted API for set id ${deal.setId}: ${response.status} ${response.statusText}`);
          continue;
        }

        const jsonResponse = await response.json();

        // Save the raw JSON response to inspect it.
        const jsonFileName = `vinted_${deal.setId}.json`;
        fs.writeFileSync(jsonFileName, JSON.stringify(jsonResponse, null, 2), 'utf-8');
        console.log(`Saved the JSON for set id ${deal.setId} to ${jsonFileName}`);

        let items = [];

        // If Vinted returns deals inside an "items" property, use that.
        if (jsonResponse.items && Array.isArray(jsonResponse.items)) {
          items = jsonResponse.items;
        } else if (Array.isArray(jsonResponse)) {
          // Otherwise, if the response itself is an array, use it directly.
          items = jsonResponse;
        }

        if (items.length > 0) {
          console.log("Extracted Vinted deals:");
          items.forEach(item => {
            // Extract the title (or a fallback message)
            const title = item.title || "No title available";
            
            // Extract the price, handling both object and simple value cases
            let priceStr = '';
            if (item.price && typeof item.price === 'object') {
              priceStr = `${item.price.amount} ${item.price.currency_code}`;
            } else {
              priceStr = item.price;
            }
            
            // Extract the URL property
            const url = item.url || "No URL available";
            
            // Log all the information in one line
            console.log(`${title}, Price: ${priceStr}, URL: ${url}`);
          });
        } else {
          console.log("No deals were found in the JSON response.");
        }
        

        // Extract item links from the API response.
        // (Adapt the extraction logic based on the actual JSON structure.)
        let itemLinks = [];
        // For example, if the JSON structure is { data: { items: [ { url: '/item/12345' }, ... ] } }
        if (jsonResponse.data && Array.isArray(jsonResponse.data.items)) {
          itemLinks = jsonResponse.data.items
            .map(item => item.url)
            .filter(url => !!url);
        } else if (Array.isArray(jsonResponse.items)) {
          // Alternatively, if the API returns items at the top level.
          itemLinks = jsonResponse.items
            .map(item => item.url)
            .filter(url => !!url);
        } else {
          console.warn(`No recognizable item list found in the JSON for set id ${deal.setId}`);
        }

        // Push the result for the current set id.
        vintedResults.push({
          setId: deal.setId,
          apiUrl,
          items: itemLinks
        });
      }
    }

    // Save the Vinted results to a JSON file.
    fs.writeFileSync('vintedResults.json', JSON.stringify(vintedResults, null, 2), 'utf-8');
    console.log('Saved the Vinted results into vintedResults.json');

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

const [, , eshop] = process.argv;
sandbox(eshop);
