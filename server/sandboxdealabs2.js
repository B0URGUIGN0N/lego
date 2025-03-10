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
            "Cookie" : "v_udt=YzJ5VndwOGFxeml1VmxkUjlzcnJPZXNPM1FiTC0tdkhJczBXUVF6SmdKc05lLy0teDl6QWVIcjZYWXZHNW40VE01SUQzQT09; anonymous-locale=fr; anon_id=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjExNzY0LCJzaWQiOiIzZDc0NjIxNC0xNzQxMDA2NjI1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MTg5NjQsInB1cnBvc2UiOiJhY2Nlc3MifQ.QAo7zy2Od7VaL1XVeg85xhjo2ICypfXl-xcrHoTMmjay853Ok9nMVR51wAPWiYOmSieZx3Bh0h6I1uZ0kUi9NOEvGflO7AZZjVFsIXjWDeVF91K6JTMHde_sN0TL1G66q18b5A6zdtgukFNXdOWgHcqzoJorOnXUrtHrMz58_155yvIOQV4ST6oWiRPDNpLv1Gfxh-EdcCO1To9ofquNutPwctznyxZske-0KLhBsbZcqmlF09VvI43VemcNv8ax0_FLPwyx_Mmzm0SAUsq3oaSicm9_wLNR4j1dYY2l8sPxImjcNrXL5kaCCveyDxgUhixjgHkBb09a-1DiWmAatw; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjExNzY0LCJzaWQiOiIzZDc0NjIxNC0xNzQxMDA2NjI1Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMTY1NjQsInB1cnBvc2UiOiJyZWZyZXNoIn0.rEIdxESDAVmK9c3Dydd6yJiXP2EpDqz6mPiUWYfwI3U961KC3VUovTIJvBhQXjrsnZFhqItqeX6yGtGAbX9wVt7R55n2JDNohp_40lK6eJue4EoMXOhNJ8BqcofFjY2OlNdfGc_qhIrn-u6uul2NXR2Vk7vVOBQ5GFceR1L4ao3rxna7vc1z2GOtc-3fK5vS0l_tC-VJJxY9gLfm-xwhWYTDDjal0B1ole12Z9RzhuPg78S06_0_tihM2zcrSj-AWKp96X-NhyZ7IW7WCTcoKeFouTvvUq6OSsdQW5or1xVgwHREoxC3TO_y_qNxg2EikjQrS45GfAgN-Xp9909e8Q; cf_clearance=piWGlzQhVH5W8p2pZqaUhgWJFnZjdIaMZj3t5lPsQVI-1741612665-1.2.1.1-bikC770b4ckS8EA1s5anDvt_znCYXizo9IXoagyJsAELbp8K8yhmOF_gP4q51m3r3MoILOxrBGqlYt5AoDcdXsMY5N9XidHg5Zc3fslDPjfpezrzKMZpOb9QD2hvK3TIBb4OoAHPO8D8KdNd1Qg.2VG6oxZA6XsMdiKAm_TDAriFNf1OTEBsq0Nm1VDBeRnYptrR_0cbXFPRQ55qaXk0GkiMMdX8uee6DMbsXfjkEgRmThjBqEIMTz057Z8Zo4Y7PGDxALQRBJuaUPFppGKeTtjbolRATuxCdqLib4zT6W3iNrYcM.AbR5k26MOVeh0vZ84ssfyfL46JAY3rGaFtnCKlU9BeMWgnR76tPfPrlczm61DKX29iMWBU593tbRMSmGpIg.Ah14SCuB76LLZGAXSpAfhGEKMLpWfkfXHpy6E; v_sid=3d746214-1741006625; _vinted_fr_session=SktNMzB5LzBpd0pONGFhc2lNYmZZR01JTFY3bHFCMFRBRzVwZ3VKR1ZDbVNrSUo1aXVMeU80NFVURWtzR2dQdUNtRnYvK3NUS0FaREdQNmZlTCtqcVMrSnRCL0lxQzdYVVNOKzBzMHEweTVCWFNFcWNzT1lDZWlaQkNORUZmcjY1Wm5XT0laZVZEWDNHb3JjRDk3TEQrMm4zQlpScXFmZEZzY3pHQTNhV1FycitLK3ByU2s1NHkzMW5ySHh0OTVjS09GQ0IrS01TcDZneXE3WWpEcU94d1J6K2xvbmlRRndMNUhPQ2pucXhJU3A0NWFlTUt3QnRRM0JZQnoydVNXY1V4aE5mMERnSWZYMW5KeHNVNDNsUFJqK0kwQmE0VEQ0cEg3MlVLUnpPakhFYk9sNWs1MmFGTCswVmE5SFI0OFgwamhWZnU3ck84OVZTK0FyOGNVRHI4eEsvNVFDNWxVQWdwdXMzNVQ3YkdIL0RvQmtMYUMxWEQxZ241OWJpd3ZHVStuSWZKZmlRY1FDVnBIMmRoRnVwNU9MNmsxdXlvSmNRWHc3b003dVBCeU8wQm5xVnFXbWZROGNFN2tEa1ZRUEd5ME82b3dOcVVLeU12SjJrbmFFSWpZSEhlUHkvTWRXOG5PZDYwaFcyd1dWZUcrR2hmWGxuMWk0ZTFaeUExa0wwdndXcnZaOExzbDN5TmJ6QnFoWXhKNGJLWi9GQ0NEeE1RRzltMUZJY0Q1bFdWZDl6bGQrRGgya2N5NFp0RkVoMEpWbVhtWHJhRHZKYUQwLzFuUEZDN3JRM2YzTjlOeTAwNTlmc1g2eXFzbWtCSnRMdGhrbVZHaTNySEpUTEo5c2o2c3V3RUR3YlZMMW5ydDNhRG9zcCtSK2tLK2xhd1pNbVF6VEdQa3AxekNPeWRid2xyMm1MU3VRaUpZN2VUUDlxbENVYVlHaVlwcEdEWXVkcG5sWGRGdE9CenY1MlJHKzB2RXArSjBxWXZnekxJOXR0TFRYSnlpTVZvMGVQS3lCM0JLMHVJYWxucHhnbWlaSGNEbVJ6V1I2NWcxN0luV0FRQUY0c3FXRFZtZVhXUVk4S1ZvRVJkNHBZSm5nZnhtME5mMnRVSk90NkdZZU40V21neG9LU1cyRlBGaHVJZTA0SGRvZUkyZWdQR1Rpb3NqZEdUeXNLSE1NSDR4Q0Npd29XaGErR25uWmsvcytaY0I3ZTBVcnVaREx5VHhFTjZ6cyt1cHFjZTNlMGJmeXJyTE5CYUdlNksxdE9TNDFuNUNkM3hlMDEvWEN0S08zS05EcTdQNzZRczNVb3M2Y1kzbWwzWXVpRWZYQ20vcDlKbDdnbHQwbmE3RWEwNm5tRm42UHM1cWRER2tEamdxQnArWUQ2bDB3MGYzY0liWURZTTZha2YwZCtpdzRKRWRGODIvdEpsdVYyRmZoeGEwUWVPeVNxaEVrRnFKNW1IZXgrZ0puMm1wNUxEelFzMmxBMHNuNzV2V1JJYnpZdlZScjM1dGpTVjJ6UjZuZS9pMzYrQS9XQnJRNHYxaWNnVjRwL2tCUE02Q0RSWkJtTmZ4bC9ZZjlWRnI4eGZlbHFOcG9oU2Z3RTRka2pVS0VqR2J5OU9QVTNIQWxYSXk1VFRoV3lnU3YxMVdOUjhQcUFzRmZDWVNzanRJSEZKMm1aSzh6YnA3aE14SFdDY1kxSzVNdnltazVNRmRCM2FVZDY1eFpXN3p2V2RKMGRydUcyOVlBWWN5Q1N1RHIrSTBjMnQrUitOY2hBS2MwcHhyVktmV3hWL0VNVVhBdm1wQkh1Qk9YdVRYUWhVVGZsWUY1NFJlM2xGQWxyMDFPV3llRXVJWitvWWliU2VWVTZSTXpDdlEwaitsS1cyN1ByWnl6OFkreTlPcEtMZGFtMWJKeUN1MWkwczB4NDM5M3RvSWxnNFdxY2tGY2pVVVNmT2piaTZycVFaZzdFOW5tV1M1eS9nKzN2UFBvVVVISC9GNDZIaUcrbW1pV3RJUDkrRWdmMzJaMlZzM2p1UUFSd2FHamVOOE01SVBKSjJLbkJSNWxUcnNXTWIyWUc0Wnh2Z1J6aFJGK2d0OXB0WjVKS2Y3Z2xDYURoRjR3VVlrckoxMDVSeERManZVeC9xT3Rtd2VCN09UTm9MVjU2TFNEVEFuUFhDalMrL1BPYkxvV3hhTmxqdVBMM1gxdlJQaHlnaUxUZThmUWk1ZHhNYzY1cGE1b24wL0pYakhhT3ZuZEMzWDVWOWlSUWl6VzNSL3N4MHdXTkx4bEY2Zm5odnA5aTBHbUxYV1lLNk1WWUFHSDVLWEJiT0psVE5WR3RUMzczTTF1a29USEowbnUydm5HanpCaFN4M0NSZnEvdG1kZGhTdEVSbXNhT0RLMS0tTlBKS0x2NlhXUzMxRW1UNDVldU1SZz09--fe0daa7e4f9eda6ecc9ad42ec528edec0735a9bc; datadome=hSi0TkQuUy~liKlSurgE_7RB9aYQdggpLqp9ITHVrjVRZLT6uB9ptdAeHzvUbAJZk4qpR42tRMgei4AWOx5e33NQ37NKK8KI1mQxErnvQcF1w8B~fpyPzpdb9Dn84ly3; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+10+2025+14%3A10%3A41+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=489ab767-1ff9-4b5c-9aa2-8fa5aea807c2&interactionCount=21&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3B; domain_selected=true; OptanonAlertBoxClosed=2025-03-03T12:57:13.648Z; eupubconsent-v2=CQNsN1gQNsN1gAcABBENBfFgAAAAAAAAAChQAAAAAAFhIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAXgAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AGIAMWAZCAyYBowDTQGpgNeAbQA2wBtwDj4HOgc-A8oB8QD7YH7AfuBA8CCIEGAINgQrHQSgAFwAUABUADgAIAAXQAyADUAHgARAAmABVgC4ALoAYgA3gB6AD9AIYAiQBLACaAFGAK0AYYAygBogDZAHeAPaAfYB-wEUARgAoIBVwCxAFzALyAYoA2gBuADiAHUAQ6Ai8BIgCZAE7AKHAUfApoCmwFWALFAWwAuABcgC7QF3gLzAX0Aw0BjwDJAGTgMqgZYBlwDOQGqgNYAbeA3UBxYDkwHLgPHAe0A-sCAIELSABMABAAaABzgFiAR6Am0BSYC8gGpgNsAbcA58B5QD4gH7AQPAgwBBsCFZCA4AAsACgALgAqgBcADEAG8APQAjgB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRgAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeApsBYoC2AF5gMnAZYAzkBrADbwHtAQPJADwALgDuAIAAVABHoCRQErAJtAUmAxYBuQDygH7gQRAgwUgbAALgAoACoAHAAQQAyADQAHgARAAmABVADEAH6AQwBEgCjAFaAMoAaIA2QB3wD7AP0AiwBGACggFXALmAXkAxQBtADcAIdAReAkQBOwChwFNgLFAWwAuABcgC7QF5gL6AYaAyQBk8DLAMuAZzA1gDWQG3gN1AcmA8cB7QEIQIWlAEAAFwASACOAHOAO4AgABIgCxAGvAO2Af8BHoCRQExAJtAUgAp8BXYC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWWgAgKbAAA.YAAAAAAAAAAA; OTAdditionalConsentString=1~; v_sid=3d746214-1741006625; __cf_bm=gGpQy67To9rBSWI5S1Y5uFWG01PcrOkLN0T6OK90Sv4-1741611763-1.0.1.1-hnbxtQeu4i4aUSghilgAu7HNkIlV9W78lq0.kV6fW1mGFU0hDtMQtTSTKewmyk3yT8osVxdEk2Z2FUafDouR6cU0JzJz2DAJMH_7BL5cL84o1R4JLmz3AB1aOG8SBmjO; viewport_size=281; banners_ui_state=PENDING"
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
            // Assuming that each item has "title" and "price" properties.
            // Depending on the API response, the price might be a simple number, or an object.
            const title = item.title || "No title available";
            let priceStr = '';
            if (item.price && typeof item.price === 'object') {
              // In case price is an object (for example, { amount: "12.50", currency_code: "EUR" })
              priceStr = `${item.price.amount} ${item.price.currency_code}`;
            } else {
              // Otherwise assume price is a simple value.
              priceStr = item.price;
            }
            console.log(`${title}, Price: ${priceStr}`);
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
