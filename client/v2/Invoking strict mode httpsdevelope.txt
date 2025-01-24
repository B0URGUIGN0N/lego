// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};
let allDeals = []; // All fetched deals


// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Fetch all deals across pages
 * @param  {Number}  size - number of deals per page
 * @return {Array} - all deals
 */
const fetchAllDeals = async (size = 6) => {
  const allFetchedDeals = [];
  let currentPage = 1;
  let fetched;

  do {
    fetched = await fetchDeals(currentPage, size);
    allFetchedDeals.push(...fetched.result);
    currentPage++;
  } while (currentPage <= fetched.meta.pageCount);

  return allFetchedDeals;
};


/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};*/

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      const discount = deal.discount ? `${deal.discount.toFixed(2)}% OFF` : "No Discount";
      return `
      <div class="deal" id=${deal.uuid}>
        <span><strong>ID:</strong> ${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <span><strong>Price:</strong> $${deal.price}</span>
        <span><strong>Discount:</strong> ${discount}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select a page to browse deals
 */
selectPage.addEventListener('change', async (event) => {
  const selectedPage = parseInt(event.target.value); // Get the selected page number
  const deals = await fetchDeals(selectedPage, parseInt(selectShow.value)); // Fetch deals for the selected page and current size

  setCurrentDeals(deals);
  render(currentDeals, currentPagination); // Render the updated data
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Instantiate the discount filter selector
const selectDiscountFilter = document.querySelector('#discount-filter');

/**
 * Filter deals based on the selected discount filter
 * @param {Array} deals - list of deals
 * @param {String} filter - selected filter value
 * @return {Array} - filtered deals
 */
const filterDealsByDiscount = (deals, filter) => {
  if (filter === 'best-discount') {
    return deals.filter(deal => deal.discount && deal.discount >= 50);
  }
  return deals;
};

/**
 * Apply pagination to a filtered deal list
 * @param {Array} deals - list of deals
 * @param {Number} page - current page
 * @param {Number} size - number of deals per page
 * @return {Array} - paginated deals
 */
const paginateDeals = (deals, page, size) => {
  const start = (page - 1) * size;
  const end = start + size;
  return deals.slice(start, end);
};

/**
 * Render all deals with applied filters and pagination
 */
const renderDealsWithFilters = () => {
  const selectedFilter = selectDiscountFilter.value;
  const filteredDeals = filterDealsByDiscount(allDeals, selectedFilter);
  const paginatedDeals = paginateDeals(
    filteredDeals,
    currentPagination.currentPage,
    parseInt(selectShow.value)
  );

  render(paginatedDeals, {
    ...currentPagination,
    count: filteredDeals.length,
  });
};


/**
 * Update the displayed deals based on the selected discount filter
 */
selectDiscountFilter.addEventListener('change', () => {
  const selectedFilter = selectDiscountFilter.value;
  const filteredDeals = filterDealsByDiscount(currentDeals, selectedFilter);

  render(filteredDeals, currentPagination); // Render filtered deals
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
// Handle number of items per page change
selectShow.addEventListener('change', async (event) => {
  const size = parseInt(event.target.value);
  allDeals = await fetchAllDeals(size);
  currentPagination = { currentPage: 1, pageCount: Math.ceil(allDeals.length / size), count: allDeals.length };

  renderDealsWithFilters();
});

// Handle page selector change
selectPage.addEventListener('change', (event) => {
  currentPagination.currentPage = parseInt(event.target.value);
  renderDealsWithFilters();
});

// Handle discount filter change
selectDiscountFilter.addEventListener('change', () => {
  renderDealsWithFilters();
});

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', async () => {
  allDeals = await fetchAllDeals();
  currentPagination = { currentPage: 1, pageCount: Math.ceil(allDeals.length / parseInt(selectShow.value)), count: allDeals.length };

  renderDealsWithFilters();
});

