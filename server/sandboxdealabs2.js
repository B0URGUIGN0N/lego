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
            "Cookie" : "v_udt=YzJ5VndwOGFxeml1VmxkUjlzcnJPZXNPM1FiTC0tdkhJczBXUVF6SmdKc05lLy0teDl6QWVIcjZYWXZHNW40VE01SUQzQT09; anonymous-locale=fr; anon_id=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2; cf_clearance=0ACWB4HEcHAqygoY9HKEzSIX4P7M7z7OVNg5ETJ2jc0-1743345503-1.2.1.1-t2H8tm1.Yg4qZVgnnNy2TmKj6.3b2wX_slPTz.mq87UTo_0jPEHPHP8g2s.sd8henCj2nh8hI1gHrxCYeRDRJcqQWa6KG3Fjna4DmG5iFC6iCPNxR.pJaqGsKLGFFYOX7gdPu4yabapdr.kt6RJSWz9g4SF_aLLciDBjTvM9iU3d4Vz56PCO1GSRztWyu7Ekd7RgHSz_iliCUiuvjjWdzWe89BGZeDpAdF8LCgO3F5VtwFDoe4cl5DF3HDh0OcdqP8iHc0lrX3jCUTVAknwMvin.BYzRq1j.lg9ssVlo5L8TNJkSsFuz2AvxgGu5.0kuYqx6emskWTatZBU8Tq3jT_o6SQzAWzhhqMcPaCQYPrg; v_sid=f6714129-1743327222; datadome=wMHJK8P80pLj1dq1rRYSGXuNkbCGu65FqCaYhwrjAutsQTY9bgQw9~AsZg6RpHKVC6u~FOuWjhZ_UpyySAOfmVCe5ZO~UBzrC4Tjt76BfY8v70JkcXvQOEpz6k5WoBUp; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Mar+30+2025+16%3A38%3A27+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2&interactionCount=34&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3B; domain_selected=true; OptanonAlertBoxClosed=2025-03-03T12:57:13.648Z; eupubconsent-v2=CQNsN1gQNsN1gAcABBENBfFgAAAAAAAAAChQAAAAAAFhIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAXgAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A8oB8QD7YH7AfuBA8CCIEGAINgQrHQSgAFwAUABUADgAIAAXQAyADUAHgARAAmABVgC4ALoAYgA3gB6AD9AIYAiQBLACaAFGAK0AYYAygBogDZAHeAPaAfYB-wEUARgAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABMABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B5QD4gH7AQPAgwBBsCFZCA4AAsACgALgAqgBcADEAG8APQAjgB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRgAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeApsBYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbAALgAoACoAHAAQQAyADQAHgARAAmABVADEAH6AQwBEgCjAFaAMoAaIA2QB3wD7AP0AiwBGACggFXALmAXkAxQBtADcAIdAReAkQBOwChwFNgLFAWwAuABcgC7QF5gL6AYaAyQBk8DLAMuAZzA1gDWQG3gN1AcmA8cB7QEIQIWlAEAAFwASACOAHOAO4AgABIgCxAGvAO2Af8BHoCRQExAJtAUgAp8BXYC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWWgAgKbAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzMzQ1NDkwLCJzaWQiOiJmNjcxNDEyOS0xNzQzMzI3MjIyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDMzNTI2OTAsInB1cnBvc2UiOiJhY2Nlc3MifQ.ez60dDv06wdQewDnFQw55_yEhxWN6KKgaqDGMzlIgnE6Lbr_4Q4OilfnZx9_ECv537TMfthKvuMAUNBmaoZjPq_odvPvleRouVR5Ez6m7JqZgIzEMdLGOcMCkkX9mhx8S8AEUZAmkEkvvvvMoz18KVQ8FG-1qcTyluhqTMXcZoqaInQAJhR_2k26RNluj7nQMlfRaU5VySogIl9ou-H-ascpsKI3DFBMaNjDQiamTTX7ho78sCPP2YizT2DMs-e7y43fU1niegIXUAAxkS0bLjkGM1o8_UIAKzWQPS6b5nkMaJaBsktmXYTKXzIcq_kmjE1iXtBM1PP2MYmBR9rm_Q; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzMzQ1NDkwLCJzaWQiOiJmNjcxNDEyOS0xNzQzMzI3MjIyIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM5NTAyOTAsInB1cnBvc2UiOiJyZWZyZXNoIn0.Jkl3VkoAZ9Ul2OGS1FQc9zVFzWdMI_wHujzghWepJxCMP9zkD1XHEczKPXZgbASWMgYOQP_HUsPW77rL_fxu5jsic55hzvYZoqJrjrTIVCLyRJegeIgWHcCJCxi0A2bAfcYuYslIbkjHMe0Eyg-abk62C4mtBmdRDYnuXZlKLt9Q82dF7s6VjHz-jFsZeHZuhmsMOcpb1uoQbWRbpRa_GdNIMUQ8IpQrdulAiHsbNZP2g-KhVjSywtItcydk-uJUCE6JgZcUUfmzdnzYsBPdGHanI5KoqChWj3H9Z4X_4ZXVsjblCTsVsaASNrLFABwzkY-_HuiwzyRhlU9ywjsqQg; viewport_size=591; _vinted_fr_session=N29MbGsrRTMwV1lLVjZrMUlwdDd6ZGRYUks1U043QWtZYXhMM3M1M0xHZ2VsaDB2MnhkSlZCdHhMMTVNWWc1djlGZEZkdXY2MWRobmdPcGJ2aXFITXYvRzkveDd0T2FTTVo2dENISTJyMWJlYlpxZFNEOU92YkZMQnErSWFucUlsUytpb0RyZnczbTVNUHVWcVE2K2Z1SkR3L2hSQTJuSTZycUI4bVdmUHFsOHRQc0NjdFArTytzdXFubmFxTkpUQnh4RHd2eXBYdDhPNVRwWDd0M21XeVNtSTJ5dWp1TEVWS29MYlZmMk96anpGWkpWaGtIVjlxM3BWNkZteHNYK1Zzb0E3QjY1bS81dWk1dWFhN1lkbXdWSkNsWlRXd2FlTjVjUXdYVmI0RWFuUXhJSC9WMzBXMHpzNDRCTWp6YnVwdHpvdU5YdTJsTFpaelVQNldReTBjSFZyeE0wYXRNZXR2TEVRTEwxRWI0TXovNk95VkxVNVg3ZWJBRk1DbEI4MmNPRG1uOUJYaXN3TFQ1MHRZNWVLc2k0UTU2czJYdlRtWjFnZm5NVlIzUHhxdXZ2K09EV0Y5WGhDWk1LOHNjUVVGOGdLcU0yQWd3djFxRUMxUlBVYmQwdHhwQTUzMzFjWDA4M3RDU2owOWk1TlZtUTNsaEo0NDV5eUJIY2RQNXMyS1VlQTFOTkkxVERqd2tkYWV1bnJIMENmR2pRWXRZc05FNCt5NjdGNXVldWdHTnN1VVExR09CSlI3eFZwZ3B2cHAzRkZSb09LdTR1Z0lSMFRndGlnWlIxMW91cGZxR2pkd1Z5YVZhNjV4bTZaTTF2b3lLbzRwQ2h1bDJyTzBINGFCcWJzSFZNVnhOSVNvUEdGbDY0eXVGOWZrT1RralozRTRlZDlLcnhVRmtnMTd5Zy9SeVI0aU1TU2p3VmtyQWhCWEpXbkFUdVdkc05TbGlQd0M4cTVSTUliK3Z6dFBCaTF6VlRsQW9kQnY3TkxzSGFYaGI5RjlIMzVVTmVqa3ozU0RvTEFTeHBrc1lwcjlnN1pFZGpKRjE1OHIwcEJQVG1oQW9mZ3piSGxZeUJXblRFMGdwTDg1dHNOL2NJeHdwZXVtM2NHMU1zY0JIazNpZkZKbWcyWjNtZHR1dElqbVVTMnhLSFQ3SDdoeXVuSDZlME9MbXhHY0pjYW15MnkwWmUzSmQ3Y1VyKzRadWxQbDlNUEVvSlhPWGxFMlM3cnBENHR1eHZHWkdnRDFsVHJkYWZibHlTeStIb0Y3Wjh5SHJvOFB4ZnlNWmtGQmhjdTBnQlRCKzNxNjdnT0UzcjVnZ28yclpMRmJDam1tSEh0TVVvNkpDaTNjUndjNjRIOHNVWFNMM0U3TkFLcUNKNVRpRWkrZnRHWWY5c2p0VVlWTEpiV290cTN4L1hRVCtJcVBGNWljMGtLOVh6MGV5czgvdDBSZytpUkxFT0lRTy9Xa0pYbXBQN3Z6azRVQXpBbjZLSUNWSFplUzBkd2NzbjV3Z05aNGpsRE92VXdjMSs4YlY4VDRxMHhwWCtURit6bjFaTHZ4U2l2VUR5dDR0bEFGWWRlZENKK1h3RWxWZVhmbENyamQyaGhyczhla2dGYWhUWFRGVXdPSGhDQjZYTnVFOWx6TEd3SlRCT2RxamtMQkVabm1Mc1E2QnlEbmdtY0xVNHNTWThKTHNORzRRaHVTSU52d2JZNjZIU1BNTkF4RDVQTUViRytzTlFXTW42cmxVc3YxZXVwVEw2djc2cEM5UGxTdHdvdlpDTWI4bmVtU2hnNy8zZlRsVVE0d29lOWZvM3ppOGtSOWVxZ084OENNd0g2OUNrYWtiaXI0WURpdEpla1k0RVJpeXliQWdrQWtIdSs2Rm13UGwrUmxBNE1GS3E3SUgrR203ejFRc2dMbGhMamVSelh6VnUzUVZxWFQ2ZkhxY1BiTFIyZEJjaDlsempMT0RCSTU2RTNyQmMweEZTMGtHWDRnUzRNa1dkQUNjU3doRlg5S1ZiaitXcnczK0h4YWRoOTdXYTJsUUZrcHNQMUxEdEpHK1lNb2lCNzE3Q3Z0a0J2OWhRSFF5ZTlKdTM2czd4eElkajAvakxpdWhZektQeXp4dGFxM2dFaDFIdDF3MHV3SzV1T3BGYkZGeTZGSFhvemltWjExQzNENzZ2akVpVzFzM1VpZUdXR1hCNkd4L25Qd2hWREh6ZkQvNnNDUEF6RkhVM3ZSRzBORm9vblUvdUdEY2JsTGptdnRFbXV3NnMreithenE0aTl0VnBlVWZGSjdvSXV5NTdzbFBjSXhJbkFIcHBMMjBMUVQ2TXNBaGVLUXhTekpyM0t3RXdkS1M5emlidzUyST0tLXlTRlN6cWVCY2lmeURUM0s1akplOWc9PQ%3D%3D--f80ac85d6a58c762a7a4fa5d7048e086f1754313; __cf_bm=S4XhomqTJtjwsgerZTauna8iRYc7DQYt8qkxzh4CJ7c-1743345489-1.0.1.1-xWDurAj27AWJYh7D6MZYqZdBD_XpboTQdg0h0cR8OPgQAHVYFai96YazGe2DXG_W269mit12YFIadFJqEuY_F_0WLIIpeTXXc85U0SzMU3OKJrNZJaoZ5SQpkH_WFh4S; banners_ui_state=SUCCESS"
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
