const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

module.exports.scrape = async url => {
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      return [];
    }

    const body = await response.text();

    // Save HTML to a file for inspection
    fs.writeFileSync('fetched_html.html', body);
    console.log('✅ Fetched HTML saved to fetched_html.html');

    // Load the HTML into Cheerio
    const $ = cheerio.load(body);

    // Extract deals
    const deals = $('div.js-threadList article') // Target each article
      .map((i, element) => {
        // Extract the link
        const link = $(element)
          .find('[data-t="threadLink"]')
          .attr('href');

        // Extract the JSON data from the div.js-vue2
        const vueData = $(element)
          .find('div.js-vue2')
          .attr('data-vue2');

        let data;
        let price = null, previousPrice = null, discount = null, title = null, temperature = false;

        if (vueData) {
          try {
            // Parse the JSON data
            data = JSON.parse(vueData);
            const thread = data?.props?.thread;

            // Extract thread details
            title = thread?.title || null;
            price = thread?.price || null;
            previousPrice = thread?.nextBestPrice || null;
            discount = previousPrice && price ? Math.round(((previousPrice - price) / previousPrice) * 100) : null;
            temperature = thread?.temperature || false; // Extract temperature property

          } catch (err) {
            console.error('❌ Error parsing JSON:', err);
          }
        }

        // 🚨 Skip deals with missing data
        if (price === null || previousPrice === null || discount === null) {
          return null;
        }

        // Use a regular expression to find a string of 5 numbers within the title.
        let setId = "Error";
        const regex = /\b\d{5}\b/;
        const match = title && title.match(regex);
        if (match && match[0]) {
          setId = match[0];
        }

        return {
          title,
          link,
          price,
          previousPrice,
          discount,
          temperature,  
          setId,  // add the new property here
        };
      })
      .get() // Convert Cheerio collection to an array
      .filter(Boolean); // Remove null values

    return deals;
  } catch (error) {
    console.error('❌ Error scraping data:', error);
    return [];
  }
};
