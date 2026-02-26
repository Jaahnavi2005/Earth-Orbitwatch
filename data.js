// =============================================
// ORBITWATCH - data.js
// This file is responsible for:
// 1. Fetching real debris data from local server
// 2. If server not running, uses sample data
// 3. Processing/cleaning that data
// 4. Making it available to the rest of the app
// =============================================


// =============================================
// MAIN FETCH FUNCTION
// First tries local server (localhost:3000)
// If that fails, automatically uses sample data
// =============================================
async function fetchDebrisData() {
    try {
        // First try the local server
        const response = await fetch("http://localhost:3000/debris");

        if (!response.ok) throw new Error("Server not running");

        const rawData = await response.json();

        console.log("✅ Live data loaded from server:", rawData.length, "objects");

        // Transform CelesTrak format into OrbitWatch format
        const processedData = rawData.map(obj => {
            const altitude = calculateAltitude(obj);
            return {
                name:        obj.OBJECT_NAME || "Unknown",
                noradId:     obj.NORAD_CAT_ID,
                altitude:    Math.round(altitude),
                inclination: obj.INCLINATION?.toFixed(2),
                riskLevel:   determineRisk(obj, altitude),
                latitude:    Math.random() * 180 - 90,
                longitude:   Math.random() * 360 - 180
            };
        });

        // Save globally for app.js
        window.debrisData = processedData;

        // Dispatch event so app.js knows data is ready
        window.dispatchEvent(new CustomEvent("debrisDataLoaded", {
            detail: processedData
        }));

    } catch (error) {
        // Server not running — use sample data instead
        console.warn("⚠️ Server not available, using sample data:", error.message);
        // Show a subtle notice to the user
const errorMsg = document.getElementById('errorMessage');
if (errorMsg) {
    errorMsg.style.display = 'block';
    errorMsg.style.color = '#ffd700';
    errorMsg.textContent = '📱 Showing sample data — run server for live data';
}

        const sampleData = getSampleData();

        window.debrisData = sampleData;

        window.dispatchEvent(new CustomEvent("debrisDataLoaded", {
            detail: sampleData
        }));
    }
}


// =============================================
// CALCULATE ALTITUDE FROM ORBITAL DATA
// Uses mean motion to calculate altitude in km
// =============================================
function calculateAltitude(obj) {
    const mu = 398600.4418; // Earth's gravitational parameter
    const meanMotionRad = obj.MEAN_MOTION * 2 * Math.PI / 86400;
    const semiMajorAxis = Math.pow(mu / (meanMotionRad * meanMotionRad), 1/3);
    return semiMajorAxis - 6371; // subtract Earth radius to get altitude
}


// =============================================
// DETERMINE RISK LEVEL
// Uses both altitude AND eccentricity
// More accurate than altitude alone
// =============================================
function determineRisk(obj, altitude) {
    if (altitude < 500 || obj.ECCENTRICITY > 0.01) {
        return "high";
    }
    if (altitude < 2000) {
        return "medium";
    }
    return "low";
}


// =============================================
// SAMPLE DATA
// 20 real debris objects used as fallback
// when server is not running
// =============================================
function getSampleData() {
    return [
        { name: "COSMOS 2251 DEB",    noradId: 33788, altitude: 780,  inclination: "74.0", riskLevel: "medium", latitude: 45.2,  longitude: -120.5 },
        { name: "FENGYUN 1C DEB",     noradId: 29228, altitude: 430,  inclination: "98.6", riskLevel: "high",   latitude: -62.1, longitude: 80.3   },
        { name: "IRIDIUM 33 DEB",     noradId: 33766, altitude: 510,  inclination: "86.4", riskLevel: "high",   latitude: 70.5,  longitude: 155.2  },
        { name: "SL-8 R/B",           noradId: 10966, altitude: 960,  inclination: "65.8", riskLevel: "medium", latitude: 30.1,  longitude: -45.7  },
        { name: "COSMOS 1408 DEB",    noradId: 49271, altitude: 470,  inclination: "82.9", riskLevel: "high",   latitude: -55.3, longitude: 200.1  },
        { name: "SL-16 R/B",          noradId: 22285, altitude: 850,  inclination: "71.0", riskLevel: "medium", latitude: 55.0,  longitude: -90.0  },
        { name: "ARIANE DEB",         noradId: 20596, altitude: 1400, inclination: "7.0",  riskLevel: "low",    latitude: 5.0,   longitude: 30.0   },
        { name: "DELTA 1 DEB",        noradId: 12326, altitude: 550,  inclination: "89.9", riskLevel: "high",   latitude: -80.0, longitude: 60.0   },
        { name: "SL-3 R/B",           noradId: 2802,  altitude: 300,  inclination: "65.4", riskLevel: "high",   latitude: 40.0,  longitude: -10.0  },
        { name: "COSMOS 3M DEB",      noradId: 26900, altitude: 1100, inclination: "83.0", riskLevel: "medium", latitude: -70.0, longitude: 100.0  },
        { name: "BREEZE-M DEB",       noradId: 37749, altitude: 620,  inclination: "49.5", riskLevel: "high",   latitude: 22.4,  longitude: 75.3   },
        { name: "CZ-4C DEB",          noradId: 40906, altitude: 490,  inclination: "97.4", riskLevel: "high",   latitude: -33.6, longitude: 142.8  },
        { name: "TITAN 3C TRANSTAGE", noradId: 3432,  altitude: 1380, inclination: "32.5", riskLevel: "low",    latitude: 18.9,  longitude: -66.1  },
        { name: "PEGASUS DEB",        noradId: 22671, altitude: 740,  inclination: "94.1", riskLevel: "medium", latitude: 60.2,  longitude: 33.7   },
        { name: "RESURS-1 DEB",       noradId: 20536, altitude: 350,  inclination: "82.3", riskLevel: "high",   latitude: -44.5, longitude: -170.2 },
        { name: "ZENIT-2 DEB",        noradId: 27006, altitude: 890,  inclination: "71.0", riskLevel: "medium", latitude: 51.8,  longitude: 88.4   },
        { name: "METEOR 2-5 DEB",     noradId: 11593, altitude: 1200, inclination: "81.2", riskLevel: "medium", latitude: -29.3, longitude: -55.6  },
        { name: "THOR AGENA DEB",     noradId: 1148,  altitude: 280,  inclination: "99.0", riskLevel: "high",   latitude: 77.1,  longitude: 12.3   },
        { name: "SL-14 DEB",          noradId: 14258, altitude: 1600, inclination: "62.8", riskLevel: "low",    latitude: 38.5,  longitude: -97.4  },
        { name: "COSMOS 954 DEB",     noradId: 10693, altitude: 410,  inclination: "65.5", riskLevel: "high",   latitude: -15.7, longitude: 44.9   },
    ];
}


// =============================================
// START — runs automatically when page loads
// =============================================

fetchDebrisData();
