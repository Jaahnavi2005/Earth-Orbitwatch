// =============================================
// ORBITWATCH - app.js
// This is the main controller file that ties everything together
// It coordinates between data loading, globe visualization, and UI updates
// =============================================

// =============================================
// GLOBAL VARIABLES
// =============================================
let debrisData = []; // Will hold all debris objects
let filteredData = []; // Will hold filtered results

// =============================================
// MAIN INITIALIZATION
// This runs when the page loads
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("OrbitWatch app starting...");
    
    // Set up event listeners first
    setupEventListeners();
    
    // Listen for data to be loaded
    window.addEventListener('debrisDataLoaded', function(event) {
        console.log("Debris data loaded event received!");
        debrisData = event.detail;
        filteredData = [...debrisData];
        
        // Update stats
        updateStatistics();
        
        // Plot on globe
        if (typeof plotDebrisOnGlobe === 'function') {
            plotDebrisOnGlobe(filteredData);
        }
        
        // Display in table
        displayDebrisTable(filteredData);
        
        // Hide loading message
        hideLoadingMessage();
    });
    
    // Also check if data is already available (in case data.js loaded first)
    if (typeof window.debrisData !== 'undefined') {
        console.log("Data already available, initializing immediately...");
        debrisData = window.debrisData;
        filteredData = [...debrisData];
        
        updateStatistics();
        if (typeof plotDebrisOnGlobe === 'function') {
            plotDebrisOnGlobe(filteredData);
        }
        displayDebrisTable(filteredData);
        hideLoadingMessage();
    }
});

// =============================================
// SETUP EVENT LISTENERS
// =============================================
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAndDisplayData();
        });
    }
    
    // Risk filter dropdown
    const riskFilter = document.getElementById('riskFilter');
    if (riskFilter) {
        riskFilter.addEventListener('change', function() {
            filterAndDisplayData();
        });
    }
}

// =============================================
// FILTER AND DISPLAY DATA
// Applies search and risk filters, then updates displays
// =============================================
function filterAndDisplayData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const riskFilter = document.getElementById('riskFilter').value;
    
    // Start with all data
    filteredData = debrisData.filter(function(debris) {
        // Apply search filter
        const matchesSearch = debris.name.toLowerCase().includes(searchTerm) ||
                             debris.noradId.toString().includes(searchTerm);
        
        // Apply risk filter
        const matchesRisk = riskFilter === 'all' || debris.riskLevel === riskFilter;
        
        return matchesSearch && matchesRisk;
    });
    
    console.log(`Filtered to ${filteredData.length} objects`);
    
    // Update displays
    if (typeof plotDebrisOnGlobe === 'function') {
        plotDebrisOnGlobe(filteredData);
    }
    
    displayDebrisTable(filteredData);
}

// =============================================
// UPDATE STATISTICS
// Updates the stat cards at the top
// =============================================
function updateStatistics() {
    // Total count
    const totalCount = document.getElementById('total-count');
    if (totalCount) {
        totalCount.textContent = debrisData.length.toLocaleString();
    }
    
    // High risk count
    const highRiskCount = document.getElementById('high-risk-count');
    if (highRiskCount) {
        const highRisk = debrisData.filter(d => d.riskLevel === 'high').length;
        highRiskCount.textContent = highRisk.toLocaleString();
    }
    
    // LEO count (altitude < 2000km)
    const altitudeCount = document.getElementById('altitude-count');
    if (altitudeCount) {
        const leo = debrisData.filter(d => d.altitude < 2000).length;
        altitudeCount.textContent = leo.toLocaleString();
    }
}

// =============================================
// DISPLAY DEBRIS TABLE
// Populates the HTML table with debris data
// =============================================
function displayDebrisTable(data) {
    const tableBody = document.getElementById('debrisTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add rows for each debris object
    data.forEach(function(debris) {
        const row = document.createElement('tr');
        
        // Add click event to focus on this debris
        row.addEventListener('click', function() {
            if (typeof focusOnDebris === 'function') {
                focusOnDebris(debris);
            }
        });
        
        // Style the row based on risk level
        row.style.cursor = 'pointer';
        row.style.transition = 'background-color 0.3s';
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
        
        // Create cells
        row.innerHTML = `
            <td>${debris.name}</td>
            <td>${debris.noradId}</td>
            <td>${debris.altitude}</td>
            <td>${debris.inclination}</td>
            <td>
                <span class="risk-badge ${debris.riskLevel}">
                    ${debris.riskLevel.toUpperCase()}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// =============================================
// HIDE LOADING MESSAGE
// =============================================
function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// =============================================
// SHOW ERROR MESSAGE
// =============================================
function showErrorMessage() {
    const errorMessage = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (errorMessage) {
        errorMessage.style.display = 'block';
    }
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// =============================================
// UTILITY: Format large numbers with commas
// =============================================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
