// Invoking strict mode
'use strict';

// Current deals and pagination info
let allDeals = []; // Store all fetched deals
let currentDeals = [];
let currentPagination = {};

// Instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectDiscountFilter = document.querySelector('#discount-filter');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/** 
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from the API for a specific page and size
 * @param {Number} page - current page to fetch
 * @param {Number} size - size of the page
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
      return { currentDeals, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentDeals, currentPagination };
  }
};

/**
 * Fetch all deals across pages
 * @param {Number} size - number of deals per page
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
 * Filter deals based on the selected discount filter
 * @param {Array} deals - list of deals
 * @param {String} filter - selected filter value
 * @return {Array} - filtered deals
 */
/**
 * Filter deals based on the selected filter
 * @param {Array} deals - list of deals
 * @param {String} filter - selected filter value
 * @return {Array} - filtered deals
 */
const filterDealsByDiscount = (deals, filter) => {
  if (filter === 'best-discount') {
    return deals.filter(deal => deal.discount && deal.discount > 50);
  } else if (filter === 'most-commented') {
    return deals.filter(deal => deal.comments && deal.comments > 15);
  }
  else if (filter === 'Hot Deals') {
    return deals.filter(deal => deal.temperature && deal.temperature > 100);
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
 * Render list of deals
 * @param {Array} deals
 */
/**
 * Render list of deals
 * @param {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      const discount = deal.discount ? `${deal.discount.toFixed(2)}% OFF` : 'No Discount';
      const comments = deal.comments ? `${deal.comments} Comments` : 'No Comments';
      const temperature = deal.temperature? `${deal.temperature}°C` : 'No Temperature';
      return `
      <div class="deal" id=${deal.uuid}>
        <span><strong>ID:</strong> ${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <span><strong>Price:</strong> $${deal.price}</span>
        <span><strong>Discount:</strong> ${discount}</span>
        <span><strong>Comments:</strong> ${comments}</span>
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
 * @param {Object} pagination
 */
const renderPagination = pagination => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { length: pageCount },
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render number of deals indicator
 * @param {Object} pagination
 */
const renderIndicators = pagination => {
  const { count } = pagination;
  spanNbDeals.innerHTML = count;
};

/**
 * Render the page
 * @param {Array} deals - filtered deals
 * @param {Object} pagination - pagination info
 */
const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
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
 * Event Listeners
 */

// Handle number of items per page change
selectShow.addEventListener('change', async event => {
  const size = parseInt(event.target.value);
  allDeals = await fetchAllDeals(size);
  currentPagination = { currentPage: 1, pageCount: Math.ceil(allDeals.length / size), count: allDeals.length };

  renderDealsWithFilters();
});

// Handle page selector change
selectPage.addEventListener('change', event => {
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
