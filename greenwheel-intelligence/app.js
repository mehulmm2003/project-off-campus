/* ==========================================================================
   GreenWheel Intelligence — Core JavaScript Engine
   Handles OCR scanning simulations, interactive databases, dynamic dashboards,
   scrap estimation logic, flowchart controllers, and form responses.
   ========================================================================== */

// --- Mock RTO Database ---
const mockRTODatabase = {
    'DL3CAY1234': {
        plate: 'DL-3C-AY-1234',
        make: 'Tesla Model 3 Performance (Electric)',
        ecoScore: 94,
        scoreColor: 'good',
        overallStatus: 'COMPLIANT',
        overallBadgeClass: 'badge-pulse bg-success-subtle text-success',
        statusClass: 'status-legal',
        rc: { status: 'Legal & Valid', expired: false, indicator: 'fa-circle-check text-success' },
        puc: { status: 'Not Applicable (Zero Emissions EV)', expired: false, indicator: 'fa-circle-check text-success' },
        insurance: { status: 'Active (Third-Party Core)', expired: false, indicator: 'fa-circle-check text-success' },
        roadTax: { status: 'Exempt & Fully Cleared', expired: false, indicator: 'fa-circle-check text-success' },
        diagnostic: 'This electric vehicle demonstrates optimal compliance metrics. Zero tailpipe emissions bypasses standard PUC checks. Registration is legally valid until 2035. Recommended Action: Zero operational updates required. Green-track classification enabled.',
        stage: 1
    },
    'MH12PQ9999': {
        plate: 'MH-12-PQ-9999',
        make: 'Honda Civic 1.8V Petrol i-VTEC (2010)',
        ecoScore: 32,
        scoreColor: 'bad',
        overallStatus: 'ILLEGAL VEHICLE',
        overallBadgeClass: 'bg-danger-subtle text-danger',
        statusClass: 'status-illegal',
        rc: { status: 'Expired (16 Years Old - Exceeded 15 Yr Limit)', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
        puc: { status: 'Expired (High Carbon Hydrocarbons Detected)', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
        insurance: { status: 'Expired (Uninsured Operator Risk)', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
        roadTax: { status: 'Unpaid (Due 1 Year)', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
        diagnostic: 'CRITICAL ALERT: Vehicle exceeds the 15-year statutory RTO lifecycle limit for petrol combustion vehicles in this jurisdiction. Operation on public roads presents severe environmental risks and carries legal penalties. Suggested Action: Secure immediate decommissioning. Recyclable metal value estimated at $1,250.',
        stage: 4
    },
    'KA51MB4567': {
        plate: 'KA-51-MB-4567',
        make: 'Suzuki Swift Dzire Diesel VDi (2014)',
        ecoScore: 58,
        scoreColor: 'warn',
        overallStatus: 'WARNING PENDING',
        overallBadgeClass: 'bg-warning-subtle text-warning',
        statusClass: 'status-warning',
        rc: { status: 'Valid (Expires 2029)', expired: false, indicator: 'fa-circle-check text-success' },
        puc: { status: 'Expired (14 Days Grace Period Active)', expired: true, indicator: 'fa-triangle-exclamation text-warning' },
        insurance: { status: 'Valid (Expires Dec 2026)', expired: false, indicator: 'fa-circle-check text-success' },
        roadTax: { status: 'Cleared & Fully Paid', expired: false, indicator: 'fa-circle-check text-success' },
        diagnostic: 'COMPLIANCE NOTICE: Registration remains legally active, but emissions (PUC) certificate expired 4 days ago. Vehicle represents an active diesel smog hazard. Grace period is currently active. Action Needed: Schedule an emissions inspection at the nearest GreenWheel partner center to prevent RTO escalation.',
        stage: 3
    }
};

// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Start count up numbers for metrics
    animateMetricCounter('metric-vehicles', 124820, 1500, '');
    animateMetricCounter('metric-compliance', 91.44, 1500, '%');
    animateMetricCounter('metric-co2', 2480, 1500, 't');

    // Initialize Charts
    initCharts();

    // Trigger initial calculation
    calculateScrap();
});

// --- Metric Counters Animation ---
function animateMetricCounter(id, targetVal, duration, suffix) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const isFloat = targetVal % 1 !== 0;
    const stepTime = Math.abs(Math.floor(duration / 60));
    
    const timer = setInterval(() => {
        start += targetVal / (duration / stepTime);
        if (start >= targetVal) {
            start = targetVal;
            clearInterval(timer);
        }
        el.innerText = isFloat ? start.toFixed(2) + suffix : Math.floor(start).toLocaleString() + suffix;
    }, stepTime);
}

// --- OCR Scanner View Tabs ---
function switchScanTab(tabName) {
    document.getElementById('tab-text-btn').classList.toggle('active', tabName === 'text');
    document.getElementById('tab-image-btn').classList.toggle('active', tabName === 'image');
    
    document.getElementById('scan-tab-text').classList.toggle('active', tabName === 'text');
    document.getElementById('scan-tab-image').classList.toggle('active', tabName === 'image');
}

// --- OCR Matrix Scanning Core ---
function executeOCRSearch(plateKey, customPlateText = '') {
    const laser = document.getElementById('scanner-laser');
    const display = document.getElementById('scanner-display-content');
    const engineStatus = document.getElementById('ocr-engine-status');
    const engineLatency = document.getElementById('ocr-engine-latency');
    
    const placeholder = document.getElementById('result-placeholder');
    const resultBox = document.getElementById('result-content');
    
    // UI Scanning State Activation
    laser.classList.add('scanning');
    engineStatus.innerText = 'Scanning Engine...';
    engineStatus.className = 'text-warning';
    
    // Hide results initially
    resultBox.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    // Simulate image readout framing inside viewport
    const displayPlate = customPlateText ? customPlateText.toUpperCase() : (mockRTODatabase[plateKey] ? mockRTODatabase[plateKey].plate : 'PLATE_ERR');
    display.innerHTML = `
        <div class="hud-ocr-tag pulse-soft" style="position:static; margin-bottom:8px;">${displayPlate}</div>
        <p class="text-info"><i class="fa-solid fa-sync fa-spin"></i> Reading Character Matrix...</p>
    `;
    
    const randomLatency = Math.floor(Math.random() * 600) + 400; // 400ms - 1000ms latency
    
    setTimeout(() => {
        // Complete Scan Simulation
        laser.classList.remove('scanning');
        engineStatus.innerText = 'Online / Matched';
        engineStatus.className = 'text-success';
        engineLatency.innerText = randomLatency + ' ms';
        
        display.innerHTML = `
            <i class="fa-solid fa-circle-check large-icon text-success"></i>
            <p class="text-success">OCR Processing Complete</p>
            <div class="font-plate mt-2" style="font-size:1.1rem; color:#FFFFFF;">${displayPlate}</div>
        `;
        
        // Populate and Render Ledger Reports
        let data = mockRTODatabase[plateKey];
        
        // Generate randomized realistic data for un-listed custom typed search inputs
        if (!data) {
            data = generateCustomPlateRecord(displayPlate);
        }
        
        renderComplianceLedger(data);
        
    }, 1800);
}

// --- OCR Action Trigger Shortcuts ---
function runTextSearch() {
    const rawVal = document.getElementById('plate-input').value.trim();
    if (!rawVal) {
        alert('Please enter a valid license plate number first.');
        return;
    }
    // Standardize text key
    const normalizedKey = rawVal.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    executeOCRSearch(normalizedKey, rawVal);
}

function selectPresetPlate(key) {
    executeOCRSearch(key);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const laser = document.getElementById('scanner-laser');
    const display = document.getElementById('scanner-display-content');
    
    display.innerHTML = `
        <i class="fa-solid fa-file-image large-icon text-info fa-bounce"></i>
        <p class="text-info">Uploading ${file.name}...</p>
    `;
    
    setTimeout(() => {
        // Generate a random plate for the uploaded image file
        const randomPlateLetters = ['KA', 'DL', 'MH', 'HR', 'UP'][Math.floor(Math.random() * 5)];
        const randomPlateNum = Math.floor(Math.random() * 9000) + 1000;
        const generatedPlateStr = `${randomPlateLetters}-03-EX-${randomPlateNum}`;
        const key = generatedPlateStr.replace(/[^A-Za-z0-9]/g, '');
        
        executeOCRSearch(key, generatedPlateStr);
    }, 1200);
}

// --- Generates Randomized RTO Records for Custom Inputs ---
function generateCustomPlateRecord(plateStr) {
    const coinFlip = Math.random();
    
    if (coinFlip > 0.65) {
        // Fully Legal Case
        return {
            plate: plateStr,
            make: 'Toyota Prius Hybrid (2018)',
            ecoScore: 84,
            scoreColor: 'good',
            overallStatus: 'FULLY COMPLIANT',
            overallBadgeClass: 'badge-pulse bg-success-subtle text-success',
            statusClass: 'status-legal',
            rc: { status: 'Legal & Valid', expired: false, indicator: 'fa-circle-check text-success' },
            puc: { status: 'Valid (Expires in 230 Days)', expired: false, indicator: 'fa-circle-check text-success' },
            insurance: { status: 'Active Policy', expired: false, indicator: 'fa-circle-check text-success' },
            roadTax: { status: 'Paid & Cleared', expired: false, indicator: 'fa-circle-check text-success' },
            diagnostic: 'The custom vehicle queried represents full legal standing. Emission factors sit well below environmental caps. Recommended Action: Safe travel permitted. No compliance notifications queued.',
            stage: 1
        };
    } else if (coinFlip > 0.3) {
        // Warning / Grace Case
        return {
            plate: plateStr,
            make: 'Hyundai i20 Petrol (2015)',
            ecoScore: 65,
            scoreColor: 'warn',
            overallStatus: 'WARNING ACTIVE',
            overallBadgeClass: 'bg-warning-subtle text-warning',
            statusClass: 'status-warning',
            rc: { status: 'Valid (Expires 2030)', expired: false, indicator: 'fa-circle-check text-success' },
            puc: { status: 'Expired (Grace Period Active)', expired: true, indicator: 'fa-triangle-exclamation text-warning' },
            insurance: { status: 'Valid Policy', expired: false, indicator: 'fa-circle-check text-success' },
            roadTax: { status: 'Cleared', expired: false, indicator: 'fa-circle-check text-success' },
            diagnostic: 'Soft alert registered. The vehicle RC insurance metrics are fully operational, but emission certificates have lapsed. A standard 14-day compliance grace period has been triggered. Please renew PUC coordinates soon.',
            stage: 3
        };
    } else {
        // Illegal / Expired case
        return {
            plate: plateStr,
            make: 'Mahindra Scorpio Diesel (2009)',
            ecoScore: 28,
            scoreColor: 'bad',
            overallStatus: 'CRITICAL ILLEGAL',
            overallBadgeClass: 'bg-danger-subtle text-danger',
            statusClass: 'status-illegal',
            rc: { status: 'Expired Registration (Diesel > 10 Yrs Limit)', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
            puc: { status: 'Expired Emission Certificate', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
            insurance: { status: 'Expired Protection', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
            roadTax: { status: 'Due / Unpaid', expired: true, indicator: 'fa-triangle-exclamation text-danger' },
            diagnostic: 'CRITICAL ENVIRONMENTAL FLAG: monitiored diesel asset has crossed the statutory 10-year limit for diesel engines in smart city municipal zones. The asset presents active environmental and legal liabilities. Recycling strongly advised.',
            stage: 4
        };
    }
}

// --- Renders Results Ledger Page ---
function renderComplianceLedger(data) {
    const placeholder = document.getElementById('result-placeholder');
    const resultBox = document.getElementById('result-content');
    
    // Bind General Bio Info
    document.getElementById('vehicle-overall-badge').innerText = data.overallStatus;
    document.getElementById('vehicle-overall-badge').className = `badge ${data.overallBadgeClass}`;
    
    document.getElementById('res-plate-num').innerText = data.plate;
    document.getElementById('res-vehicle-make').innerText = data.make;
    
    const ecoScoreNode = document.getElementById('res-eco-score');
    ecoScoreNode.innerText = data.ecoScore;
    ecoScoreNode.parentElement.className = `bio-score bio-score-${data.scoreColor}`;
    
    // Bind Card Details
    const rcCard = document.getElementById('card-rc');
    rcCard.className = `comp-card ${data.rc.expired ? 'status-illegal' : 'status-legal'}`;
    document.getElementById('res-rc-status').innerText = data.rc.status;
    document.getElementById('ind-rc').innerHTML = `<i class="fa-solid ${data.rc.indicator}"></i>`;

    const pucCard = document.getElementById('card-puc');
    pucCard.className = `comp-card ${data.puc.expired ? (data.overallStatus.includes('WARNING') ? 'status-warning' : 'status-illegal') : 'status-legal'}`;
    document.getElementById('res-puc-status').innerText = data.puc.status;
    document.getElementById('ind-puc').innerHTML = `<i class="fa-solid ${data.puc.indicator}"></i>`;

    const insCard = document.getElementById('card-ins');
    insCard.className = `comp-card ${data.insurance.expired ? 'status-illegal' : 'status-legal'}`;
    document.getElementById('res-ins-status').innerText = data.insurance.status;
    document.getElementById('ind-ins').innerHTML = `<i class="fa-solid ${data.insurance.indicator}"></i>`;

    const taxCard = document.getElementById('card-tax');
    taxCard.className = `comp-card ${data.roadTax.expired ? 'status-illegal' : 'status-legal'}`;
    document.getElementById('res-tax-status').innerText = data.roadTax.status;
    document.getElementById('ind-tax').innerHTML = `<i class="fa-solid ${data.roadTax.indicator}"></i>`;
    
    // Bind Diagnostic Recommendations Copy
    document.getElementById('res-diagnostic-text').innerText = data.diagnostic;
    
    // Set dynamic buttons behavior
    const scrapButton = document.getElementById('btn-action-trigger');
    if (data.ecoScore < 50) {
        scrapButton.style.display = 'inline-flex';
        scrapButton.innerHTML = `<i class="fa-solid fa-recycle"></i> Estimate Scrap Payout`;
        scrapButton.onclick = () => {
            // Smoothly jump to calculator section and select vehicle category
            document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
            // Prefill calculator based on model parameters
            if (data.make.toLowerCase().includes('civic')) {
                document.getElementById('calc-vehicle-type').value = 'sedan';
                document.getElementById('calc-mfg-year').value = '2010';
                document.getElementById('calc-fuel-type').value = 'petrol';
            } else if (data.make.toLowerCase().includes('scorpio')) {
                document.getElementById('calc-vehicle-type').value = 'suv';
                document.getElementById('calc-mfg-year').value = '2010';
                document.getElementById('calc-fuel-type').value = 'diesel';
            }
            calculateScrap();
        };
    } else {
        // High scores don't need scrapping
        scrapButton.style.display = 'inline-flex';
        scrapButton.innerHTML = `<i class="fa-solid fa-route"></i> Map Local PUC Station`;
        scrapButton.onclick = () => {
            alert('Opening coordinates mapping local registered GreenWheel eco-stations. Dynamic GPS markers are active!');
        };
    }
    
    // Render Complete Box
    placeholder.classList.add('hidden');
    resultBox.classList.remove('hidden');
    
    // Auto sync step highlights in the flowchart
    highlightWorkflowStep(data.stage);
}

// --- Interactive Step-by-Step Flowchart Controller ---
function selectFlowStep(stepNum) {
    // Clear Active Classes
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`flow-step-${i}`).classList.toggle('active', i === stepNum);
        document.getElementById(`flow-pane-${i}`).classList.toggle('hidden', i !== stepNum);
    }
}

function highlightWorkflowStep(stepNum) {
    selectFlowStep(stepNum);
}

// --- Interactive Scrap & Recycle Value Calculator ---
function calculateScrap() {
    const vType = document.getElementById('calc-vehicle-type').value;
    const year = parseInt(document.getElementById('calc-mfg-year').value);
    const fuel = document.getElementById('calc-fuel-type').value;
    const condition = document.getElementById('calc-condition').value;
    
    // Base parameters math mapping
    let baseWeight = 1100; // Kilograms
    let baseValue = 1000;  // Dollars

    switch(vType) {
        case 'hatchback': baseWeight = 950; baseValue = 900; break;
        case 'sedan': baseWeight = 1350; baseValue = 1200; break;
        case 'suv': baseWeight = 1900; baseValue = 1800; break;
        case 'twowheeler': baseWeight = 150; baseValue = 250; break;
        case 'commercial': baseWeight = 2800; baseValue = 2600; break;
    }

    // Weight/age multipliers
    let ageMultiplier = 0.85;
    if (year === 2005) ageMultiplier = 0.70;
    if (year === 2015) ageMultiplier = 1.15;
    if (year === 2020) ageMultiplier = 1.40;

    let conditionMultiplier = 1.0;
    if (condition === 'fair') conditionMultiplier = 1.25;
    if (condition === 'excellent') conditionMultiplier = 1.50;

    let carbonBonus = fuel === 'diesel' ? 1.45 : (fuel === 'cng' ? 0.90 : 1.15);

    // Final Valuation outputs
    const finalScrapVal = Math.floor(baseValue * ageMultiplier * conditionMultiplier);
    const steelRecovered = Math.floor(baseWeight * 0.72); // Average 72% steel volume recovered
    const co2Saved = (baseWeight * 3.4 * carbonBonus / 1000).toFixed(1); // Formula indexing displacement metrics
    const standardCommission = Math.floor(finalScrapVal * 0.08); // Broker commission fee 8%
    
    // Bind details to interface
    document.getElementById('calc-res-value').innerText = `$${finalScrapVal.toLocaleString()}`;
    document.getElementById('calc-res-steel').innerText = `${steelRecovered.toLocaleString()} kg`;
    document.getElementById('calc-res-co2').innerText = `${co2Saved} Metric Tons`;
    document.getElementById('calc-res-commission').innerText = `8% Commission ($${standardCommission})`;
}

// --- Submit Scrap Booking ---
function submitScrapBooking() {
    const ownerName = document.getElementById('book-owner-name').value.trim();
    const phone = document.getElementById('book-owner-phone').value.trim();
    const location = document.getElementById('calc-location').value;
    const value = document.getElementById('calc-res-value').innerText;
    
    if (!ownerName || !phone) {
        alert('Please complete the Owner Name and Mobile Phone fields to schedule scrap inspections.');
        return;
    }
    
    const bookingPanel = document.getElementById('booking-container');
    bookingPanel.innerHTML = `
        <div class="text-center py-4" style="animation: pulseGlow 1s forwards;">
            <i class="fa-solid fa-circle-check text-success" style="font-size:3rem; margin-bottom:12px;"></i>
            <h4 class="text-success">Recycling Inspection Booked!</h4>
            <p class="text-muted small mt-2">ID Reference: <strong>GW-2026-${Math.floor(Math.random() * 90000) + 10000}</strong></p>
            <p class="small mt-2" style="color:#FFFFFF;">GreenWheel authorized tower will contact you at <strong>${phone}</strong> within 24 hours to inspect your vehicle in <strong>${location}</strong>. Est. payout: <strong>${value}</strong>.</p>
            <button class="btn btn-secondary btn-sm mt-3" onclick="resetBookingForm()">Book Another Vehicle</button>
        </div>
    `;
}

function resetBookingForm() {
    const bookingPanel = document.getElementById('booking-container');
    bookingPanel.innerHTML = `
        <h5><i class="fa-truck-ramp-box text-success fa-solid"></i> Partner Scrap Pickup Portal</h5>
        <p class="text-muted small">Schedule an inspection with our government-authorized scrapping centers. We handle deregistration papers.</p>
        <div class="grid grid-2 mt-2">
            <input type="text" id="book-owner-name" placeholder="Owner Full Name">
            <input type="tel" id="book-owner-phone" placeholder="Phone (e.g. +91 98765 43210)">
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-block mt-3" onclick="submitScrapBooking()"><i class="fa-solid fa-circle-check"></i> Book Scrap Assessment</button>
    `;
}

// --- Smart Strategy Tab Controller ---
function switchStrategyTab(paneId) {
    const btns = document.querySelectorAll('.strategy-tab-btn');
    btns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(paneId));
    });
    
    const panes = document.querySelectorAll('.strategy-pane');
    panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `strategy-${paneId}`);
    });
}

// --- Interactive Chart.js Initializations ---
let complianceDoughnut;
let complianceBar;

function initCharts() {
    // Doughnut Chart Setup
    const ctxDoughnut = document.getElementById('complianceDoughnutChart');
    if (ctxDoughnut) {
        complianceDoughnut = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Fully Compliant (Legal)', 'Grace Period Warnings', 'Expired RC / Critical Illegal'],
                datasets: [{
                    data: [114136, 8410, 2274],
                    backgroundColor: [
                        '#10B981', // Emerald Green (Legal)
                        '#F59E0B', // Amber (Grace Warnings)
                        '#EF4444'  // Crimson (Critical Violations)
                    ],
                    borderColor: '#0D1322',
                    borderWidth: 3,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9CA3AF',
                            font: { family: 'Outfit', size: 11, weight: '500' },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // Bar Chart Setup
    const ctxBar = document.getElementById('complianceBarChart');
    if (ctxBar) {
        complianceBar = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Expired RC', 'Expired PUC', 'Unpaid Tax', 'Lapsed Insurance'],
                datasets: [{
                    label: 'Active Failures Detected',
                    data: [3120, 6840, 1890, 4210],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.85)',  // Red
                        'rgba(245, 158, 11, 0.85)',  // Amber
                        'rgba(6, 182, 212, 0.85)',   // Teal
                        'rgba(16, 185, 129, 0.85)'   // Green
                    ],
                    borderColor: 'transparent',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9CA3AF', font: { family: 'Outfit', size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#9CA3AF', font: { family: 'Outfit', size: 11 } }
                    }
                }
            }
        });
    }
}

// --- Smart Grid Policy Scenario Simulator ---
function triggerGridSimulation() {
    const btn = document.querySelector('.fleet-sim-card button');
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing telemetry...`;
    btn.disabled = true;

    setTimeout(() => {
        // Shift metrics dramatically representing a major compliance policy shock
        // (e.g. diesel limits dropping from 15 to 10 years, instantly flagging thousands of cars)
        
        // Target simulation stats
        const targetCompliant = 98450; 
        const targetFlagged = 19120;
        const targetRecycles = 7250;
        
        // Animate simulation values
        animateMetricCounter('sim-fleet-compliant', targetCompliant, 800, '');
        animateMetricCounter('sim-fleet-flagged', targetFlagged, 800, '');
        animateMetricCounter('sim-fleet-recycles', targetRecycles, 800, '');
        
        // Update live charts with simulation datasets
        if (complianceDoughnut) {
            complianceDoughnut.data.datasets[0].data = [targetCompliant, targetFlagged, targetRecycles];
            complianceDoughnut.update();
        }
        
        if (complianceBar) {
            complianceBar.data.datasets[0].data = [8420, 14210, 4890, 8950];
            complianceBar.update();
        }

        // Restore button state
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Policy Shift Calculated`;
        btn.classList.replace('btn-secondary', 'btn-primary');
        
        // Highlight system dashboard alerts
        document.getElementById('dash-stat-compliant').innerText = targetCompliant.toLocaleString();
        document.getElementById('dash-stat-compliant').className = 'stat-val text-warning';
        
        document.getElementById('dash-stat-warnings').innerText = targetFlagged.toLocaleString();
        document.getElementById('dash-stat-warnings').className = 'stat-val text-warning';
        
        document.getElementById('dash-stat-violations').innerText = targetRecycles.toLocaleString();
        document.getElementById('dash-stat-violations').className = 'stat-val text-danger';
        
        document.getElementById('metric-compliance').innerText = '78.87%';
        
    }, 1500);
}
