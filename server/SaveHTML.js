const fetch = require('node-fetch');
const fs = require('fs');

/**
 * Save HTML to a file for debugging
 * @param {String} filename - The name of the file
 * @param {String} content - The HTML content to save
 */
const saveHTMLToFile = (filename, content) => {
  fs.writeFileSync(filename, content, (err) => {
    if (err) {
      console.error('Error saving HTML file:', err);
    } else {
      console.log(`HTML saved to ${filename}`);
    }
  });
};

/**
 * Fetch HTML from a URL and save it to a file
 * @param {String} url - The URL to fetch
 * @param {String} filename - The name of the file to save the HTML
 */
module.exports.fetchAndSaveHTML = async (url, filename = 'raw_html_output.html') => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    if (response.ok) {
      const body = await response.text();
      saveHTMLToFile(filename, body); // Save the HTML to the specified file
    } else {
      console.error('Failed to fetch the page:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching HTML:', error);
  }
};
