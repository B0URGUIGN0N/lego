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
            "Cookie" : "v_udt=YzJ5VndwOGFxeml1VmxkUjlzcnJPZXNPM1FiTC0tdkhJczBXUVF6SmdKc05lLy0teDl6QWVIcjZYWXZHNW40VE01SUQzQT09; anonymous-locale=fr; anon_id=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2; cf_clearance=cxV4E1K2PpvasKmDvbEh3Zd2XqRJxHb5fUWMIaPq9l4-1743768109-1.2.1.1-Uss2Xzttz2KlduIi.W6TkzBK7uDH2nulTeHAAaykQcw677mfFncOv9qTjIGsR2Ctn1gokHBQPoX3CshyaLtMHSS2TFpM0Dg9iNdsBNmDVv7JhS.Po3EpMzfWfOqhgjRbW.BzVtBXgvX0eipdB6W2hPX7woCz68BPV9dWw_vdWUDWFwJj5XJq28J0EtAOQmrDup0bieaWpwKjVyLlGasmBsx2g93_fujnn9hT5iP.Gk6XUFxAmCUiN7q6Q2Wt1KhQPGw7Lw.hUXFV25o2IimMyjodJZgJvPi74jc14bfi_aI_cIV7aVEPW7jGEPgxPTSY50sS0rA0jlZysJHx2u3ZLAqqGQ.GO2tSnYBM3OTmr9g; v_sid=f6714129-1743327222; datadome=T0_izEc9MlkBv7dx2JLBbgC~u_IrphXi4J~coYuhDbFwzOeksD6pStXPVhjGTrvPMHeyIsK2CCJa8id9TMoTarrgaRJownEv~qoVyWJ4H06IID1PCeMOLYUJpZ~UJ79v; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Apr+04+2025+14%3A05%3A26+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2&interactionCount=43&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3B; domain_selected=true; OptanonAlertBoxClosed=2025-03-03T12:57:13.648Z; eupubconsent-v2=CQNsN1gQNsN1gAcABBENBfFgAAAAAAAAAChQAAAAAAFhIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAXgAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A8oB8QD7YH7AfuBA8CCIEGAINgQrHQSgAFwAUABUADgAIAAXQAyADUAHgARAAmABVgC4ALoAYgA3gB6AD9AIYAiQBLACaAFGAK0AYYAygBogDZAHeAPaAfYB-wEUARgAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABMABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B5QD4gH7AQPAgwBBsCFZCA4AAsACgALgAqgBcADEAG8APQAjgB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRgAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeApsBYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbAALgAoACoAHAAQQAyADQAHgARAAmABVADEAH6AQwBEgCjAFaAMoAaIA2QB3wD7AP0AiwBGACggFXALmAXkAxQBtADcAIdAReAkQBOwChwFNgLFAWwAuABcgC7QF5gL6AYaAyQBk8DLAMuAZzA1gDWQG3gN1AcmA8cB7QEIQIWlAEAAFwASACOAHOAO4AgABIgCxAGvAO2Af8BHoCRQExAJtAUgAp8BXYC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWWgAgKbAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNzY4MTA1LCJzaWQiOiJmNjcxNDEyOS0xNzQzMzI3MjIyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM3NzUzMDUsInB1cnBvc2UiOiJhY2Nlc3MifQ.FLHdcW2d_wYYH6-xNMpXIbt-aNA5JxdZRfSqFaBcJmJscXDmdUXTjJNVapu8IpInYzcvy-Z8xvf2ygWFYzjv-IwzsoXKjySX6Ky7bi4omxjCDvwJlMLbromc9YxhglLtV_SuXy9yzaRaqYyizXGvTzHjhB6p7Tt0IlboF1Y4FO5eHBI3Sbvx-Dt63xDsCOaI174aHt8pyvGKkLbrFrbX4Fz9-Ldc8XJ3LcdRA0btdezAmcYiEQ-gHjQxVrKWa5lhp8yv_jAkIseUyLlg48yHzPWDQ7ps_9BB4WZvSaNoU8d_lnpQ5N4owR27XfHAkrSmtgF6V-AUU-3T9otIvT_EsA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNzY4MTA1LCJzaWQiOiJmNjcxNDEyOS0xNzQzMzI3MjIyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQzNzI5MDUsInB1cnBvc2UiOiJyZWZyZXNoIn0.PN00UEolyVoH0ZrdC9rh5vzYYvyJgtMQNK8lGnjSIBnyBIsIjbqq9yGiXRzaxt5Abkyi7UwrKlPWu7eJs--4c022MctI8JLFYEFXWIIG7HY6nyNacKfjoYiSg6Kvlvi9sqoi2tcqvsDVMMqEx3CxjJuAU4Y9J8Q6lS7qm5Si-e8TaoofUpOtz_hbclOMPqMHmvln6a2l6z3H1AMF-JAFLWjn9zf15g9SyXOfPPVJhMca1j6BkDSrxuemvjLkgPRbfUoCWAeqg3RbJqvDPhSwCHRRHW5rVUgpd7qGVcJ_zxwwHeXy1fhV6Y4pjHOKrHXkdKdolLxEoJQ1Z3Vt4vXzww; _vinted_fr_session=RTBIZmcwMzJKS2Z0WGNmSlEvOE9pUEhqRXZKbDllNTYwY0ROOGRRSXpQK0tIQkF2RGo1dW5iZkV0K0Jyc0EyWUV2T2FFanFRRDZSSmFNbnNlckcxMC85MU8vc0c1N2R1TXhWMVFlWjRFSVlSUVNISHl4NzZVdXpmU2c3OVNGWGMxSjRMNHdXeVE2WTRJN1JYVjJDWkoyaUZGV0RId3hmSlNsN2s3ejRHNG5pSWNVbForcVd4MW9OWWoyS3hkWkh3UmQ5c1drbjBIL3NMVjE1QmFLZmVMbFBKL2d5dFBoL2t0OWJsVTN2QURVVjEzZW52MytLZ2lzRlFyTm0yNngvUDNGWWxMSGUrbFZnVVZWRHIzc2ExbWNHY01lWTB2WVhETGZpbkJnT09NalAzc1hQUDJscWFUSXhQOXhIclpZTXJ4NisrcXdOUmxuaWFQbUk2a3R0QjRIRHhKTUtJemZFcnpvRC9Jd05SbU05WUxXWHI3aE9QS1lvbjBhZXYrdm5TWXE2YkFKNGpsYWw4L1JjTWx1VjhabzJoL252bU5yN01EWkZBVlNSYzhuUFl1V2FwM05HdCswOUFScExkdHhkVWEzY25FWkRaMXVCZWJCbDlTL3VVUEJLa1VtQVhyTzhrcjNRWjBDcnJVdEFkYVdJbEtxRjdxY1o5SHlLZWhGbW1paTdYQkd5WUtqZFY2akxZR2pxclZDTmZIdzF2Y0E3azFEeDhzamRoanNHbEtQRWFvT2dhUXA4MVdEa2tIcDkzbmxleGwyd3pSR3JSTnJrNHZXSzZLOUVrUnVKK3o1L0ZLYnovSDZ2cG91SVhPbk5vS3JoMjVhdEVaTDVCSU5ROE9xeGNRQjIxOW9FODVkQmRlMVZ2ck5lUVhPc21xTnhpajk1RHY1ajJuWlhJOFp3OFpZdUkwTE12ZkNxTTdjTXRUSzFCTzd0cmJJRnlMU3F0anM1STkxS0w1VzJiS213ZjdMQU5SOE02TzFPazRmSlZaaE1ETXhXVlcrczNPeVh3c1ZWZG1YckxpMVRGQ3o4NmdWaHhDZm5lTnZCb3h6cUJzRHR4a2pIY21lZE5qaFNTQzBhd0VTU25GUFdsK1ZySnplbkg1UzlyYldOMkp5UWl6RWJ0R3ZOS1AzalRHRDlRNysyWjlLZklyTGJETHA0T2xhajRZcWpKY3dEeFMrSVhwbXBHWDlTcmVlRHlJRUhkV0hTQzVoV1lRQ0hZKzZrYW85ai9nZkFuaXR2VG5wNy94RzFRR2NFWTNpWWpBSmpNN0EvNkNMNHMzR3Z3U1BJNTJyOTdLb3JUdzM0ZmNrUUNpQy9vdUpVMWZ4UlBQZFB3OUZhZXdVUU1jQVM5dFVMNDZNY1l6alJPbUhZUCtXdlBxMkR6NjVOWFYwa1h3Z3lHajFGV1pFbUlCTjhiK01Wc1E0WXdGUDNtU0RpNUpQUlZSN0M2cU5MaEplNTdsVDhGWEVXS1hJV1RIdmJaNXp0Wlh2SnFPQTJXZXI1a2kyVHg4dDJBeXNtQWJJaGN4Q2FNOHNtSCtwcDFSVHQwbnZyekhFNHJmbG9YN0ZBazUveGNocUlTVG1maFN2dUZ5V3NoT3g2UG1GU0h1T042VXJTYVNvY1NEZDdGd3gwU1VIYVZwSVJXcklIaE9xcUNXZTRPc29OQ2tyV2dWdWt1Q21wcXRSY2MzUSt5VkE2Qm1FTm1iZURTb1NQUG4rdkRyWW04MzNIQmRTK3o3clBpZUpNMllzV1RnRks2cFNhNHdUUHU4OUpHOW5vV1dVT0lWOVB6MkJDSkZoVlVyRCtVYUlxTlV0dGRDcGtpR1N5T1hWUEVBQnFXbFNJSVFFdmM1ai9QZHlSYS9XNGhmNDFma0Z0Z3YrcTZvbTNQMFBrWGtpVmJCWUg0b0xEQy91K0NhbnNqMDNTZlhrdnhpMGhFbEdIeENEdFpoRE1nNHZkbGNCMDI3dWQxM0J3SXFKTVJOUmV5SkFSZnJHSEV3MHFaMTAwZEdwSDJsZVBSWHYza2k2SG1GR3d5ZzJ5U0RNM1hFS2c2NDVXcEx1ekU0eXVmQ0Mwa2lBeXVvYk4xY2V3enpyQW02K3hVVGZtMElCQ2tFNk0vSlJIL21Wa3Fia2xQTyt5VFFiODEyaHZXeTUvOGN4RVJvZzNSRy9nL081c0RUdEZTMUoyck9qN3Z3U2hYdVhaRFdyV3hNdFNpOXRWS0xNYVVjNmhWRUNRZlFDa0l3QVVKNFB4b1VhVmN2eHJMS0FwVmF2ZkluL3FUR0ZvQi9GNjRTWERxL3hFSE1yZ2EwZEJlL3lkTTR2dUR1Y2JwdlBsaVJFcDNrYnNIWHNhc0ZYOFRZYlFOdlBpdWlsQXFLaVU4NVFDcUdReUJFLytrZXFtUy0teFBuMUw1Zy9RK0FrM00wdGpuSm0xQT09--f08c40cc9475634c62f8a96ec7748b70995eb1f6; __cf_bm=ThEJp3DtvWDKgasIKfLRw4h91bfkHGUPuhPOAxuEdNc-1743768102-1.0.1.1-mjFR7YffVw_aYsp9Uc59lo5xl0ou4hfzjaD5NeBbV4IoCaZzPrqeaGxcX8vAWegF0DQXCtEh_oDUBSfQUtQmtGz90R5.1EsiTtOYwoFQ2oldF3IC53rbMMYrH8zi36WW; banners_ui_state=SUCCESS;"
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

        const vintedDeals = [];

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

            // Create a new object with the id, title, and price
            const vintedDeal = {
              id: deal.setId,
              title: title,
              price: priceStr
            };

            vintedDeals.push(vintedDeal);

            // Log all the information in one line
            console.log(`${vintedDeal.id}, Title: ${vintedDeal.title}, Price: ${vintedDeal.price}`);
          });
        } else {
          console.log("No deals were found in the JSON response.");
        }

        // Save the Vinted deals to a file
        const vintedDealsFilePath = path.join(outputDir, `Vdeals_${deal.setId}.json`);
        fs.writeFileSync(vintedDealsFilePath, JSON.stringify(vintedDeals, null, 2), 'utf-8');
        console.log(`Saved the Vinted deals to ${vintedDealsFilePath}`);
        
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
