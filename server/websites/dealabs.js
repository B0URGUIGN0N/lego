const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

module.exports.scrape = async url => {
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

  const $ = cheerio.load(body);

  const deals = $('.threadListCard-body').map((i, element) => {
    const title = $(element).find('a.cept-tt.thread-link').text().trim();
    const link = $(element).find('a.cept-tt.thread-link').attr('href');

    // Debug: Find any element with data-vue2
    const vueContainer = $(element).closest('[data-vue2]');
    console.log('🔍 VUE CONTAINER:', vueContainer ? 'FOUND' : 'null');

    const vueData = vueContainer.attr('data-vue2');
    console.log('🔍 Extracted data-vue2:', vueData);

    let price = null, previousPrice = null, discount = null;

    if (vueData) {
      try {
        const jsonData = JSON.parse(vueData);
        if (jsonData?.props?.thread) {
          price = jsonData.props.thread.price || null;
          previousPrice = jsonData.props.thread.nextBestPrice || null;
          discount = jsonData.props.thread.percentage || null;
        }
      } catch (error) {
        console.error("❌ Error parsing JSON:", error);
      }
    } else {
      console.warn('⚠️ No data-vue2 found for this item!');
    }

    return { title, link, price, previousPrice, discount };
  }).get();

  return deals;
};
