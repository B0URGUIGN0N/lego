const fs = require('fs');
const { fetchAndSaveHTML } = require('./SaveHTML'); // Import the new file
const dealabs = require('./websites/dealabs'); // Your existing scraper

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    // Uncomment the next line if you want to save the HTML for inspection
    await fetchAndSaveHTML(website, 'dealabs_raw_html.html');

    const deals = await dealabs.scrape(website); // Continue with your scraper logic
    console.log(deals);

    // Save the scraped deals to a JSON file
    fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2), 'utf-8');
    console.log('Saved the deals into deals.json');

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [, , eshop] = process.argv;

sandbox(eshop);
