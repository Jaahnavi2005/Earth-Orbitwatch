// =============================================
// ORBITWATCH - globe.js
// UPDATED: Added hover tooltip + click popup
// =============================================

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1YmZiNC03MjVhLTRkOGUtYmJiOS0zMDRmZmU2OWMyMDMiLCJpZCI6Mzk0NDA4LCJpYXQiOjE3NzIwNDgwNDh9.Sei95b4qmJI-Vy3-FGiQbZ6sXJdqKpYrfUy2oXXtew8';

window.addEventListener('load', function() {
    console.log("Page loaded, checking Cesium...");
    if (typeof Cesium === 'undefined') {
        console.error("CesiumJS library not loaded!");
        return;
    }
    console.log("CesiumJS loaded successfully");
});

let viewer = null;
let isRotating = true;

// =============================================
// CREATE TOOLTIP ELEMENT
// This is the floating card that appears when
// you hover over a debris dot on the globe
// =============================================
function createTooltip() {
    // Create a div element for the tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'debrisTooltip';

    // Style it to look like a floating card
    tooltip.style.cssText = `
        position: fixed;
        display: none;
        background: rgba(10, 22, 40, 0.95);
        border: 1px solid #00d4ff;
        border-radius: 10px;
        padding: 14px 18px;
        color: #e8f4fd;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        line-height: 1.8;
        pointer-events: none;
        z-index: 9999;
        min-width: 220px;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        transition: opacity 0.2s ease;
    `;
    // position: fixed = stays at cursor position on screen
    // pointer-events: none = mouse clicks pass through it
    // z-index: 9999 = appears above everything

    document.body.appendChild(tooltip);
    // Add it to the page (hidden for now)
    return tooltip;
}

// =============================================
// INITIALIZE THE GLOBE
// =============================================
function initGlobe() {
    console.log("Initializing 3D globe...");

    if (typeof Cesium === 'undefined') {
        console.error("CesiumJS not loaded!");
        document.getElementById('cesiumContainer').innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error: CesiumJS library failed to load.</div>';
        return;
    }

    try {
        viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            // ↑ We keep infoBox: false because we're
            // building our OWN better looking tooltip!
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
        });

        console.log("Cesium viewer created successfully");

        viewer.scene.backgroundColor = Cesium.Color.BLACK;
        viewer.cesiumWidget.creditContainer.style.display = "none";
        viewer.scene.globe.enableLighting = true;

        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000)
        });

        viewer.clock.shouldAnimate = true;

        // Create the tooltip element
        const tooltip = createTooltip();

        // =============================================
        // SETUP MOUSE EVENTS FOR HOVER AND CLICK
        // Cesium uses ScreenSpaceEventHandler to listen
        // for mouse events on the 3D globe
        // =============================================
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // ScreenSpaceEventHandler = mouse event listener for Cesium
        // viewer.scene.canvas = the actual canvas element


        // ---- HOVER EVENT (mouse move) ----
        handler.setInputAction(function(movement) {
            // movement.endPosition = current mouse position on screen
            // This fires every time the mouse moves

            const pickedObject = viewer.scene.pick(movement.endPosition);
            // .pick() = "what 3D object is under this screen position?"
            // Returns the entity if something is there, undefined if not

            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                // Cesium.defined() = checks if something exists (not null/undefined)
                // pickedObject.id = the entity we added with viewer.entities.add()

                const entity = pickedObject.id;
                const debris = entity.debrisData;
                // debrisData = the custom property we stored on the entity
                // (we add this in plotDebrisOnGlobe below)

                if (debris) {
                    // Build the tooltip HTML content
                    tooltip.innerHTML = `
                        <div style="color:#00d4ff; font-size:14px; margin-bottom:8px; font-weight:bold;">
                            🛰️ ${debris.name}
                        </div>
                        <div><span style="color:#7a9cc7">NORAD ID:</span> ${debris.noradId}</div>
                        <div><span style="color:#7a9cc7">Altitude:</span> ${debris.altitude} km</div>
                        <div><span style="color:#7a9cc7">Inclination:</span> ${debris.inclination}°</div>
                        <div style="margin-top:8px;">
                            <span style="color:#7a9cc7">Risk:</span>
                            <span style="
                                padding: 2px 10px;
                                border-radius: 20px;
                                font-weight: bold;
                                margin-left: 5px;
                                background: ${debris.riskLevel === 'high' ? 'rgba(255,61,61,0.2)' : debris.riskLevel === 'medium' ? 'rgba(255,215,0,0.2)' : 'rgba(0,255,136,0.2)'};
                                color: ${debris.riskLevel === 'high' ? '#ff3d3d' : debris.riskLevel === 'medium' ? '#ffd700' : '#00ff88'};
                                border: 1px solid ${debris.riskLevel === 'high' ? '#ff3d3d' : debris.riskLevel === 'medium' ? '#ffd700' : '#00ff88'};
                            ">
                                ${debris.riskLevel.toUpperCase()}
                            </span>
                        </div>
                        <div style="color:#7a9cc7; font-size:11px; margin-top:8px;">
                            Click for full details
                        </div>
                    `;

                    // Position tooltip near the mouse cursor
                    tooltip.style.display = 'block';
                    tooltip.style.left = (movement.endPosition.x + 15) + 'px';
                    tooltip.style.top  = (movement.endPosition.y - 10) + 'px';
                    // + 15px to the right of cursor
                    // - 10px above cursor
                    // So it doesn't cover what you're hovering over

                    // Make the dot bigger on hover (highlight effect)
                    entity.point.pixelSize = getPointSize(debris.riskLevel) * 2;
                    // * 2 = double the size when hovered
                }
            } else {
                // Mouse not over any debris — hide tooltip
                tooltip.style.display = 'none';

                // Reset all dot sizes back to normal
                viewer.entities.values.forEach(function(entity) {
                    if (entity.debrisData) {
                        entity.point.pixelSize = getPointSize(entity.debrisData.riskLevel);
                    }
                });
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // MOUSE_MOVE = fires when mouse moves


        // ---- CLICK EVENT ----
        handler.setInputAction(function(click) {
            // click.position = where user clicked on screen

            const pickedObject = viewer.scene.pick(click.position);

            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                const entity = pickedObject.id;
                const debris = entity.debrisData;

                if (debris) {
                    // Show a detailed popup panel
                    showDetailPanel(debris);

                    // Also fly camera to the debris
                    focusOnDebris(debris);
                }
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // LEFT_CLICK = fires when user left clicks


        console.log("Globe initialized with hover and click events!");

    } catch (error) {
        console.error("Error initializing Cesium globe:", error);
        const container = document.getElementById('cesiumContainer');
        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:100%; background:#000; color:white; font-family:'Orbitron',monospace; text-align:center; padding:20px;">
                <div>
                    <h2 style="color:#00d4ff; margin-bottom:20px;">🛰️ OrbitWatch</h2>
                    <p>3D Globe Loading Failed</p>
                    <p style="font-size:14px; opacity:0.8;">Check statistics and table below</p>
                </div>
            </div>
        `;
    }
}


// =============================================
// SHOW DETAIL PANEL
// When user CLICKS a debris dot, a full detail
// panel slides in from the right side of screen
// More info than the hover tooltip
// =============================================
function showDetailPanel(debris) {

    // Remove existing panel if open
    const existing = document.getElementById('debrisDetailPanel');
    if (existing) existing.remove();

    // Create the panel
    const panel = document.createElement('div');
    panel.id = 'debrisDetailPanel';
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 280px;
        background: rgba(10, 22, 40, 0.97);
        border: 1px solid #00d4ff;
        border-radius: 12px;
        padding: 20px;
        color: #e8f4fd;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        line-height: 1.9;
        z-index: 9999;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
        animation: slideIn 0.3s ease;
    `;

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <div style="color:#00d4ff; font-size:15px; font-weight:bold;">🛰️ Debris Details</div>
            <button onclick="document.getElementById('debrisDetailPanel').remove()" style="
                background: rgba(255,61,61,0.2);
                border: 1px solid #ff3d3d;
                color: #ff3d3d;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
            ">✕</button>
        </div>

        <div style="border-bottom: 1px solid #1a3a5c; padding-bottom:12px; margin-bottom:12px;">
            <div style="color:#00d4ff; font-size:14px; font-weight:bold;">${debris.name}</div>
        </div>

        <div style="display:grid; gap:6px;">
            <div><span style="color:#7a9cc7">NORAD ID &nbsp;:</span> ${debris.noradId}</div>
            <div><span style="color:#7a9cc7">Altitude &nbsp;&nbsp;:</span> ${debris.altitude} km</div>
            <div><span style="color:#7a9cc7">Inclination:</span> ${debris.inclination}°</div>
            <div><span style="color:#7a9cc7">Latitude &nbsp;&nbsp;:</span> ${typeof debris.latitude === 'number' ? debris.latitude.toFixed(2) : debris.latitude}°</div>
            <div><span style="color:#7a9cc7">Longitude &nbsp;:</span> ${typeof debris.longitude === 'number' ? debris.longitude.toFixed(2) : debris.longitude}°</div>
        </div>

        <div style="margin-top:14px; padding-top:12px; border-top:1px solid #1a3a5c;">
            <span style="color:#7a9cc7">Risk Level:</span>
            <span style="
                padding: 3px 12px;
                border-radius: 20px;
                font-weight: bold;
                margin-left: 8px;
                background: ${debris.riskLevel === 'high' ? 'rgba(255,61,61,0.2)' : debris.riskLevel === 'medium' ? 'rgba(255,215,0,0.2)' : 'rgba(0,255,136,0.2)'};
                color: ${debris.riskLevel === 'high' ? '#ff3d3d' : debris.riskLevel === 'medium' ? '#ffd700' : '#00ff88'};
                border: 1px solid ${debris.riskLevel === 'high' ? '#ff3d3d' : debris.riskLevel === 'medium' ? '#ffd700' : '#00ff88'};
            ">
                ${debris.riskLevel.toUpperCase()}
            </span>
        </div>

        <div style="margin-top:14px; font-size:11px; color:#7a9cc7;">
            ${debris.riskLevel === 'high' 
                ? '⚠️ Critical zone — below 500km. High collision probability.' 
                : debris.riskLevel === 'medium' 
                ? '⚡ Caution zone — active satellite region.' 
                : '✅ Lower risk zone — less congested orbit.'}
        </div>
    `;

    document.body.appendChild(panel);

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(30px); }
            to   { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}


// =============================================
// PLOT DEBRIS ON THE GLOBE
// =============================================
function plotDebrisOnGlobe(debrisArray) {
    console.log("Plotting", debrisArray.length, "debris objects on globe...");

    if (!viewer) {
        console.error("Viewer not initialized!");
        return;
    }

    viewer.entities.removeAll();

    debrisArray.forEach(function(debris) {
        const color = getRiskColor(debris.riskLevel);

        const entity = viewer.entities.add({
            name: debris.name,
            position: Cesium.Cartesian3.fromDegrees(
                debris.longitude,
                debris.latitude,
                debris.altitude * 1000
            ),
            point: {
                pixelSize: getPointSize(debris.riskLevel),
                color: color,
                outlineColor: color.withAlpha(0.3),
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000000, 1.5, 50000000, 0.5),
            },
        });

        // ---- STORE DEBRIS DATA ON THE ENTITY ----
        // This is how we retrieve the data when user
        // hovers or clicks on this dot later
        entity.debrisData = debris;
        // debrisData = our own custom property
        // We can name it anything — we chose "debrisData"
    });

    console.log("All debris plotted on globe!");
}


// =============================================
// HELPER FUNCTIONS
// =============================================
function getRiskColor(riskLevel) {
    if (riskLevel === "high")   return Cesium.Color.RED.withAlpha(0.9);
    if (riskLevel === "medium") return Cesium.Color.YELLOW.withAlpha(0.8);
    return Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.7);
}

function getPointSize(riskLevel) {
    if (riskLevel === "high")   return 6;
    if (riskLevel === "medium") return 4;
    return 3;
}


// =============================================
// AUTO ROTATION
// =============================================
function startGlobeRotation() {
    viewer.clock.onTick.addEventListener(function() {
        if (isRotating) {
            viewer.scene.camera.rotateRight(0.0003);
        }
    });
}


// =============================================
// FOCUS CAMERA ON DEBRIS
// Called from app.js when table row is clicked
// =============================================
function focusOnDebris(debris) {
    if (!viewer) return;

    isRotating = false;

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            debris.longitude,
            debris.latitude,
            debris.altitude * 1000 + 2000000
        ),
        duration: 2,
    });

    setTimeout(function() { isRotating = true; }, 3000);
}


// =============================================
// START EVERYTHING
// =============================================
initGlobe();
startGlobeRotation();