const fs = require('fs');
const path = require('path');
// Uncomment and install node-fetch if you're using a Node version before 18.
// const fetch = require('node-fetch');
const dealabs = require('./websites/dealabs'); // Your Dealabs scraper

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  Browsing ${website} website`);

    // Determine the output directory path.
    const outputDir = path.join(__dirname, 'files');
    // Create the directory if it doesn't exist.
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      for (const file of files) {
        fs.unlinkSync(path.join(outputDir, file));
      }
    } else {
      fs.mkdirSync(outputDir);
    }

    // Scrape deals and extract set ids from Dealabs.
    const deals = await dealabs.scrape(website);
    console.log('Dealabs deals:', deals);

    // Save scraped deals to files/deals.json for inspection.
    const dealsFilePath = path.join(outputDir, 'deals.json');
    fs.writeFileSync(dealsFilePath, JSON.stringify(deals, null, 2), 'utf-8');
    console.log(`Saved the deals into ${dealsFilePath}`);

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
            "Cookie" : "v_udt=YzJ5VndwOGFxeml1VmxkUjlzcnJPZXNPM1FiTC0tdkhJczBXUVF6SmdKc05lLy0teDl6QWVIcjZYWXZHNW40VE01SUQzQT09; anonymous-locale=fr; anon_id=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2; cf_clearance=KEiL2MfYE3RIEl5GdbYMJRQ.xHIMZ_pHmqMS2UlGnHU-1742224707-1.2.1.1-mjR2ofw4ZXskviJ5JmQyb3Q4IfFn1OekXD_6lWptxtXQjAjLuKb7EmZIWY6SC.rRn9HFDJUAwiAH3kj7B7yWepCb2cJa6C7QT_r4s.x1ud_GGhVCGni2ITdeksHff_i2ZOsyz4VODatpOABBSLeJlHsxY6_ht9yb6egD0u_7KHnbhCWy78S9AqGEvF1rwEwkyaAlpEK1R5TSftMMNb1HhMcyTWBSzJzL0UCnT5ksCKgLOdRI2fxhdW9wBgufXNIJIv3ATJjOBED0YAZuKV08rEWZPst_zdeqZm3fe5EMHtbWMhcG2tGgYSxV2RD50n53HsaZQ9WFdhAPoNNXfRVTo2Z6gt3CLJCFVn2DLylfj1w; v_sid=70676873-1742216632; _vinted_fr_session=aWhMWDNFTTd5Z1NCQ2x4eVRYRVh1Rzh5dkJ1R1h1L2ZKay9WQ3hjUk92RHIxQ1pzVjR5amlwcTBxeEFJU3NNRlJxWFpUY29CcmkxRFJtcFB2SXlqbWc1SEpTSjB5RldSanBmaTc4NnQ1V3AzdXVDQzR0OGhSdi84VUZWTWk5eWZJTldhWi9NNTZUbTRNQkkvTTRINXZ0SDl5aUlJOVE0MW83RTdlaDRndkgwTlJtaFVmQzg3RENuQjFiRTZYVEJsVVJQMUxoTUh4cDRXenJOWHVlQzFraVYxYVgrdUxMOXJxVHd1dkJ2aHpFc3ZqYmpXTmNEbUdzVnkyZWlhQkZTWFJiaDM5MTZpMi9zUjRyb2hpQTg0c3hvNkdpeTNhMjIzZVovaXp0ZnZuY2RQajBuSllEZmh6bFRuOTJ3ajlTOTlOYVh3Qk1Kc2w2OVRMNjIrVmtlRzZQYzg1eHhFam5DUStHcGY3cXEwK3lGeTV6VGNscmh6UHNGMm1jYkRpY0tSY2hLYkpVOTZTaytuWEtOYzRaRWhnQWJjNno1MHVyWC9ZSzUxTXd5NVBRMFV0bERZRlBlOGlBKysrTVo3ZEIyUjBOdWY1NVZRVzNwa0JURHJldSt3bURVUURkd0l0eTlST2FyMWZ0dlRWZXI4WUtIMnZnbWxKcDlhTU9XcDJWd2NsbHY0N2FscjY5d2NYcFY3VE0yV3hkTStCYTk0RldkN092U1ZiNEl2aFNXekRxaUJSUVoyUEkzeDZPZHllSnFpZEpZTngxdVRFMzM2ekp4WDRNKzZLUjNZN1pUMG45cE01eDZ4TERqcnhwNEdOQ0RpUXIwdlJJWnNNMnZjMFNvanl5amhpQTlHWVNNaEhDNlVRMkxoQW5RM2IwNmNrakpEc0tSNWRva1NrTWkraGhWQUVDb1NwZzlpd0w0Z0ZZdW1ZdEJZS2lwZ0taTFRoQzlLN3VqTWVURGhWeVRyVlF3WndWUW9BSkVBeVYwbWkwdEE3aldkbEk0MzhETVpDT3g2a2FTaXhpcWI1L1Y3ejF5T0dPclg5aUVKdml0bzVOOFN2UjNGNGFwZXA2dUUvbHIreHpQaGFtTWVKWFp2bzlWRGFyMnlIaGVLbHBjM3NqakdLZkdMVWpMQlFZLzhld2w3STVyN1dkM2FSRFZUS21yd0xadWUwY1h5MkJXaG8rMmxtL1lIS3hwMEx5d2g2c2FHZjVzU1VPeFQwQ2NyNU94MHBSTVlCSTlhNVR6K0pPbWo3SDZFNUVPMXF1MysycXNVRTlHK0FTZG9TLzFmTUM4bTdnN0tHSHRyczZGQnRZeThwNEpXOW5HUm9DSlhMaERSUG12QWg4R010cEc1anhyT2tLVE8wTXc2bHMyViswR1RLbURHTzYyRmEydVF5Ri9hYTdMSEtkY2hPZlN2UUZpS1dtL1FFTVdDL2RhRE9CN1lNaC9yc2hsNHpnWG9yZmt6Tmw2bG10dE9rZ3ZBSHQvMXI2UXBGc1F6VVNORXZjRW1ySWFRZHAzcU1lWjJmMWc2cmF2RGZiSHRXektJblk1U0szUkFDZFJlbnY2cjVROUpQdnpFZ1NLVTBNUThMNmRUT2JNV0dsRHNUVXBIVEoxb1JZMmhhb3Q3ay9DWlFnOW0yeW9wcHRRajdCcnRHT0FhMWFxQ2U1UktZMStMK3hJbU10VTZXYmRWelVlMUpwczlqS1JZNVdxKzFzTUJHVUovMWlwOWlzYmYrazh3UDlwQ2NDbFhhMzZ5cjcrSEcyUGtuekhtNWNSTHcreG11aEVGb2c5Yi9NaFduOGJlc2NTdW1HMTl6R29tMnAvNGFrR0ovK1U5SURoRGUxVXZNSGRaR3k0NUJ4MXVvRDFtSDZidzhWTDVJOEJyWjZyUW1ZbG1DSnBJdEttLzV4SVJqT2VINUdOYlBUc1lVQWRheGx0NDN3cDZVTFhNaU9QVENLQTc1ZmVCUDlVZjNnbWV3eGRrZks2VHZPQWJkWFJvc2tFeldCREJQbkgxQ0VyYlUxay8rOTRFS2FRZFhUWjZtUlRGNDVveDNya09PbmdQc2lyUk0xbXBqb3N6b1M5QnBCL1NOOHAvWVM4NHc4MU45dkN2QWlSSmswSEZuMEVRWDdlYzliVDlHaDZvSXpIVm03WTVLVjBuODFEbmZQR1Bid3VPNDJZNktra0tnSlFsRWZEQVhKSzY3b2hhOHp5Nzd1OWJOTHRFTlJkTmJXNlZ4ZC93R0lDWWd3SkR0cnNGN2RkTmRBcmpubEdaNEVNTUxWbkgrczZhSzVPQWo3YlNpTHVJdXVlRlZvcjZnZUFmRkIreHdib1dkRldVWVpkZEdzN2VPRm5EUU00TC8wUW4xT1ZueDRmbjFMUDc3T2lqZUtYZC0tajNqRUYzNDlLVmFpQzgvWXBUVTJsdz09--7596c45fc1aae0c4f3500199e5bc441f41fab144; datadome=I2mF4oivSpdzTKU0I4Cw1cpQiNSsZPA7yvoDZ~PrMGXmPyJbYbxwyb9hQBWsPtERtOt7JC3euq0ZTHpL7VxieBF_dMA1LZc4jK82sZJtaVlCMPJFBGryZCc5XY6zGOeh; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+17+2025+16%3A18%3A34+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2&interactionCount=27&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3B; domain_selected=true; OptanonAlertBoxClosed=2025-03-03T12:57:13.648Z; eupubconsent-v2=CQNsN1gQNsN1gAcABBENBfFgAAAAAAAAAChQAAAAAAFhIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAXgAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A8oB8QD7YH7AfuBA8CCIEGAINgQrHQSgAFwAUABUADgAIAAXQAyADUAHgARAAmABVgC4ALoAYgA3gB6AD9AIYAiQBLACaAFGAK0AYYAygBogDZAHeAPaAfYB-wEUARgAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABMABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B5QD4gH7AQPAgwBBsCFZCA4AAsACgALgAqgBcADEAG8APQAjgB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRgAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeApsBYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbAALgAoACoAHAAQQAyADQAHgARAAmABVADEAH6AQwBEgCjAFaAMoAaIA2QB3wD7AP0AiwBGACggFXALmAXkAxQBtADcAIdAReAkQBOwChwFNgLFAWwAuABcgC7QF5gL6AYaAyQBk8DLAMuAZzA1gDWQG3gN1AcmA8cB7QEIQIWlAEAAFwASACOAHOAO4AgABIgCxAGvAO2Af8BHoCRQExAJtAUgAp8BXYC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWWgAgKbAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyMjI0NzA3LCJzaWQiOiI3MDY3Njg3My0xNzQyMjE2NjMyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMzE5MDcsInB1cnBvc2UiOiJhY2Nlc3MifQ.vJ6fXE0xMpS_UKVleOZf6NQDNMeMgWT-YCyz7SvS38Wmc5xkQaBUXekihmKF6WOcvEpBzdM68lj1tldyfMjy41m5BWMBJm1Pk5I5gEglx11Gg14ul5Wez3h9WlQara122F40qOU031tBHUhneobtshfcuZ9xctbj13KHPwBQ0h_bIwCAl7F-6WNCvcWLdj77lIkSPNlr6yTs-aVQTQrY4mE--gFpWBXmuc2_pwnxUxKZptJN9GPLoNdk-rdFGtvFPbKEZEMaecCZNFuIVRFDXxublbWDXqewwOynsZ5V0SbEyqeDe04rDUWK-y-sZzFNguFxg07c1tiwu2pdG7LuvA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyMjI0NzA3LCJzaWQiOiI3MDY3Njg3My0xNzQyMjE2NjMyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDI4Mjk1MDcsInB1cnBvc2UiOiJyZWZyZXNoIn0.PK-zsCJarl2vJQ53rZbi5ZwsllDXmVUO9WnVOYYPoKQgLDv7rrvc4LzNA0PqFIrshHZ0fvmsT6QCpbBioKHQ7FC4Da8TD4j56GHmcyhIbzYnLiT07IK3j4-frU5XGaGVv2qSHg0pzM-KE0Cw8cPeRsErYxMYRaYDaJTJXfeQzogsTnM-xUzIP_RHC0t_sUcHP6-NEqFoeSQopOXIqTBLkUWCMmjo7osCTDNUbCXA2feMSspDeraqoJFQD-n1-qKCU6HcCV-PIewwaVeXu5gYtPE36Yqggg04OWe_afx3VHbc0m-U3G_T_i0ELIDCeeQuImGybsKX9L3--pU9ndmENQ; viewport_size=420; __cf_bm=T00GOX2L_zVPKClT.RN0Bvvq8YH1ykMlJGBD6YEdAio-1742224703-1.0.1.1-TTuUKv6MV3PJ43LtLVmYS1lHAw_7ty_FvzqAxseqNn2AhjlU0VjV9IufVAsnulJJmebr0kt28txRX6m_b6IZ8BhCRBqD8zrPDv2ZmH0iDZikSC9np4NCjcDn9omaZrT5; v_sid=70676873-1742216632; banners_ui_state=PENDING"
          },
          referrer: `https://www.vinted.fr/catalog?search_text=${searchText}`
        });

        if (!response.ok) {
          console.error(`Failed to fetch Vinted API for set id ${deal.setId}: ${response.status} ${response.statusText}`);
          continue;
        }

        const jsonResponse = await response.json();

        // Add the setId to the JSON data.
        jsonResponse.setId = deal.setId;

        // Save the raw JSON response to inspect it.
        const jsonFilePath = path.join(outputDir, `vinted_${deal.setId}.json`);
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonResponse, null, 2), 'utf-8');
        console.log(`Saved the JSON for set id ${deal.setId} to ${jsonFilePath}`);

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
        let itemLinks = [];
        if (jsonResponse.data && Array.isArray(jsonResponse.data.items)) {
          itemLinks = jsonResponse.data.items
            .map(item => item.url)
            .filter(url => !!url);
        } else if (Array.isArray(jsonResponse.items)) {
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

    // Save the Vinted results to files/vintedResults.json.
    const vintedResultsFilePath = path.join(outputDir, 'vintedResults.json');
    fs.writeFileSync(vintedResultsFilePath, JSON.stringify(vintedResults, null, 2), 'utf-8');
    console.log(`Saved the Vinted results into ${vintedResultsFilePath}`);

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

const [, , eshop] = process.argv;
sandbox(eshop);
