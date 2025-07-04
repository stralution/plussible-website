document.addEventListener("DOMContentLoaded", function() {
    const offerList = document.getElementById('offer-list');
    const filterCheckboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');
    const pagination = document.getElementById('pagination');
  
    const offers = [
        { name: "Tara's Spa", price: 110, duration: "30 minutes", extras: "Complimentary Facials", rating: "4.8/5.0", reviews: 49, distance: "4 minutes drive", image: "images/taras_spa.avif" },
        { name: "Blissful Retreat", price: 100, duration: "45 minutes", extras: "Free Aromatherapy", rating: "4.7/5.0", reviews: 60, distance: "5 minutes drive", image: "images/blissful_retreat.jpg" },
        { name: "Serenity Haven", price: 120, duration: "60 minutes", extras: "Hot Stone Included", rating: "4.9/5.0", reviews: 55, distance: "6 minutes drive", image: "images/serenity_haven.avif" },
        { name: "Relaxation Station", price: 90, duration: "30 minutes", extras: "Free Beverage", rating: "4.6/5.0", reviews: 45, distance: "3 minutes drive", image: "images/relaxation_station.jpg" },
        { name: "Calm Corner", price: 115, duration: "45 minutes", extras: "Extended Session", rating: "4.8/5.0", reviews: 70, distance: "7 minutes drive", image: "images/calm_corner.jpg" },
        { name: "Peaceful Bliss", price: 95, duration: "30 minutes", extras: "Free Foot Massage", rating: "4.5/5.0", reviews: 40, distance: "2 minutes drive", image: "images/peaceful_bliss.jpg" },
        { name: "Tranquil Touch", price: 130, duration: "60 minutes", extras: "Free Sauna", rating: "4.9/5.0", reviews: 80, distance: "8 minutes drive", image: "images/tranquil_touch.jpg" },
        { name: "Elysium Spa", price: 140, duration: "60 minutes", extras: "Personalized Oils", rating: "5.0/5.0", reviews: 90, distance: "10 minutes drive", image: "images/elysium_spa.jpg" },
        { name: "Heavenly Retreat", price: 105, duration: "45 minutes", extras: "Complementary Snacks", rating: "4.7/5.0", reviews: 65, distance: "9 minutes drive", image: "images/heavenly_retreat.jpg" },
        { name: "Zen Garden Spa", price: 125, duration: "60 minutes", extras: "Herbal Tea Included", rating: "4.8/5.0", reviews: 75, distance: "11 minutes drive", image: "images/zen_garden_spa.jpg" },
        { name: "Tranquil Escape", price: 135, duration: "60 minutes", extras: "Therapeutic Oils", rating: "5.0/5.0", reviews: 85, distance: "12 minutes drive", image: "images/serenity_haven.avif" },
        { name: "Mellow Moments", price: 110, duration: "30 minutes", extras: "Relaxation Music", rating: "4.8/5.0", reviews: 55, distance: "4 minutes drive", image: "images/taras_spa.avif" },
        { name: "Harmony Haven", price: 115, duration: "45 minutes", extras: "Hot Stone Therapy", rating: "4.7/5.0", reviews: 62, distance: "6 minutes drive", image: "images/serenity_haven.avif" },
        { name: "Soothing Sanctuary", price: 125, duration: "60 minutes", extras: "Aromatherapy", rating: "4.9/5.0", reviews: 70, distance: "8 minutes drive", image: "images/serenity_haven.avif" }
    ];
  
    const itemsPerPage = 10;
    let currentPage = 1;
  
    // Function to extract the numerical part of the distance string
    function getDistanceInMinutes(distance) {
        return parseInt(distance.split(" ")[0]);
    }
  
    // Default sorting function by price, then distance
    function defaultSort(offers) {
        return offers.sort((a, b) => a.price - b.price || getDistanceInMinutes(a.distance) - getDistanceInMinutes(b.distance));
    }
  
    // Function to render offers
    function renderOffers(offers, page = 1) {
        offerList.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = page * itemsPerPage;
        const paginatedOffers = offers.slice(start, end);
        paginatedOffers.forEach(offer => {
            const offerCard = document.createElement('div');
            offerCard.classList.add('offer-card');
            offerCard.innerHTML = `
                <div class="left">
                    <img src="${offer.image}" alt="${offer.name}">
                </div>
                <div class="middle">
                    <div class="offer-name">${offer.name}</div>
                    <div class="offer-chat">
                        <button>Active</button>
                    </div>
                    <div class="offer-rating">
                        <span class="star">&#9733;</span> <!-- Star icon -->
                        <span>${offer.rating}</span>
                    </div>
                    <div class="offer-reviews">
                        ${offer.reviews} reviews
                    </div>
                </div>
                <div class="right">
                    <div class="price">$${offer.price}</div>
                    <div class="service">Swedish Massage</div>
                    <div class="details">Duration: ${offer.duration}</div>
                    <div class="details">Extras: ${offer.extras}</div>
                    <div class="details">${offer.distance}</div>
                    <a href="#" class="engage-btn">Engage Service</a>
                </div>
            `;
            offerList.appendChild(offerCard);
        });
    }
  
    // Function to sort offers based on selected filter
    function sortOffers(criteria) {
        const sortedOffers = defaultSort([...offers]);
        criteria.forEach(criterion => {
            switch (criterion) {
                case 'lowest-price':
                    sortedOffers.sort((a, b) => a.price - b.price);
                    break;
                case 'highest-price':
                    sortedOffers.sort((a, b) => b.price - a.price);
                    break;
                case 'highest-rating':
                    sortedOffers.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                    break;
                case 'most-reviews':
                    sortedOffers.sort((a, b) => b.reviews - a.reviews);
                    break;
                case 'closest-distance':
                    sortedOffers.sort((a, b) => getDistanceInMinutes(a.distance) - getDistanceInMinutes(b.distance));
                    break;
                default:
                    break;
            }
        });
        renderOffers(sortedOffers, currentPage);
    }
  
    // Function to handle checkbox behavior
    function handleCheckboxBehavior(checkbox) {
        const oppositeFilters = {
            'lowest-price': 'highest-price',
            'highest-price': 'lowest-price',
            'highest-rating': 'highest-rating',
            'most-reviews': 'most-reviews',
            'closest-distance': 'closest-distance',
        };
  
        filterCheckboxes.forEach(cb => {
            if (cb !== checkbox && cb.value === oppositeFilters[checkbox.value]) {
                cb.checked = false;
            }
        });
    }
  
    // Function to render pagination
    function renderPagination(totalItems, itemsPerPage, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        pagination.innerHTML = '';
  
        if (currentPage > 1) {
            const prevLink = document.createElement('a');
            prevLink.textContent = '«';
            prevLink.href = '#';
            prevLink.classList.add('prev');
            prevLink.addEventListener('click', function(event) {
                event.preventDefault();
                currentPage--;
                const selectedFilters = Array.from(filterCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
                sortOffers(selectedFilters);
                renderPagination(totalItems, itemsPerPage, currentPage);
                renderOffers(defaultSort(offers), currentPage);
            });
            pagination.appendChild(prevLink);
        }
  
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.textContent = i;
            pageLink.href = '#';
            pageLink.classList.toggle('active', i === currentPage);
            pageLink.addEventListener('click', function(event) {
                event.preventDefault();
                currentPage = i;
                const selectedFilters = Array.from(filterCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
                sortOffers(selectedFilters);
                renderPagination(totalItems, itemsPerPage, currentPage);
                renderOffers(defaultSort(offers), currentPage);
            });
            pagination.appendChild(pageLink);
        }
  
        if (currentPage < totalPages) {
            const nextLink = document.createElement('a');
            nextLink.textContent = '»';
            nextLink.href = '#';
            nextLink.classList.add('next');
            nextLink.addEventListener('click', function(event) {
                event.preventDefault();
                currentPage++;
                const selectedFilters = Array.from(filterCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
                sortOffers(selectedFilters);
                renderPagination(totalItems, itemsPerPage, currentPage);
                renderOffers(defaultSort(offers), currentPage);
            });
            pagination.appendChild(nextLink);
        }
    }
  
    // Initial render with default sort and pagination
    renderOffers(defaultSort(offers), currentPage);
    renderPagination(offers.length, itemsPerPage, currentPage);
  
    // Event listener for filter change
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleCheckboxBehavior(this);
            const selectedFilters = Array.from(filterCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            sortOffers(selectedFilters);
            renderPagination(offers.length, itemsPerPage, currentPage);
        });
    });
  });
  
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".header-logo").addEventListener("click", function() {
        window.location.href = "plussible.html";
    });
  });