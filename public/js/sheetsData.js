
const sheetId = "1Rf7EGqVDLHieTWQC4iqnSox1wEUZtLAqvXm6b5g4tMg";
const lineupSheetName = "Lineup Songs";
const workersSheetName = "Workers";
const viewCountSheet = "WebViewCount"; // View count sheet
const apiKey = "AIzaSyA3G6VhZdf_0heYvIQr84u8HCerrrvsFUo";
const viewCountRange = "WebViewCount!A2"; // View count cell
const viewCountUrl = "https://script.google.com/macros/s/AKfycbz_0tJBUVBoVsHudRaQzAKC4gLWnENiXti96mipLsXuPiBE06xt7cenCd_0l6O8R8DcYw/exec";

let allLineupData = [];
let allWorkersData = [];

async function fetchSheetData() {
    const lineupUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${lineupSheetName}!B:E?key=${apiKey}`;
    const workersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${workersSheetName}!B:D?key=${apiKey}`;
    const workersUrl2 = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${workersSheetName}!F:H?key=${apiKey}`;

    try {
        const [lineupResponse, workersResponse, workersResponse2] = await Promise.all([
            fetch(lineupUrl),
            fetch(workersUrl),
            fetch(workersUrl2),
        ]);

        const lineupData = await lineupResponse.json();
        const workersData = await workersResponse.json();
        const workersData2 = await workersResponse2.json();

        allLineupData = lineupData.values || [];
        allWorkersData = workersData.values || [];
        allWorkersData2 = workersData2.values || [];

        displayLineup(allLineupData);
        displayLatestLineup(allLineupData);
        displayWorkersTable1(allWorkersData);
        displayWorkersTable2(allWorkersData2);
        
        // Update view count
        updateViewCount();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function displayLineup(data) {
    const container = document.getElementById('lineup-container');
    if (!container || !data || data.length < 2) return;
    
    container.innerHTML = '';
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 3) continue;
        
        const [date, songTitle, artist, keyInfo] = row;
        
        const songCard = document.createElement('div');
        songCard.className = 'bg-white rounded-lg shadow-md p-4 mb-4 fade-up hover:shadow-lg transition-all duration-300';
        songCard.style.animationDelay = `${i * 0.1}s`;
        
        songCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-goodtree">${songTitle || 'Untitled'}</h3>
                    <p class="text-gray-600">${artist || 'Unknown Artist'}</p>
                    ${keyInfo ? `<p class="text-sm text-gray-500 mt-1">Key: ${keyInfo}</p>` : ''}
                </div>
                <span class="bg-goodtree-lighter text-goodtree text-sm px-3 py-1 rounded-full">
                    ${date || 'No Date'}
                </span>
            </div>
        `;
        
        container.appendChild(songCard);
    }
}

function displayLatestLineup(data) {
    const container = document.getElementById('latest-lineup');
    if (!container || !data || data.length < 2) return;
    
    // Get the latest date
    let latestDate = '';
    for (let i = 1; i < data.length; i++) {
        if (data[i] && data[i][0] && (!latestDate || data[i][0] > latestDate)) {
            latestDate = data[i][0];
        }
    }
    
    // Filter songs for the latest date
    const latestSongs = data.filter(row => row && row[0] === latestDate);
    
    if (latestSongs.length === 0) return;
    
    // Display the date
    const dateHeading = document.getElementById('latest-date');
    if (dateHeading) {
        dateHeading.textContent = `Latest Lineup: ${latestDate}`;
    }
    
    container.innerHTML = '';
    
    // Create song cards for the latest lineup
    latestSongs.forEach((row, index) => {
        if (!row || row.length < 3) return;
        
        const [date, songTitle, artist, keyInfo] = row;
        
        const songCard = document.createElement('div');
        songCard.className = 'bg-white rounded-lg shadow p-3 mb-3 flex justify-between items-center fade-up';
        songCard.style.animationDelay = `${index * 0.1}s`;
        
        songCard.innerHTML = `
            <div>
                <h4 class="font-medium text-goodtree">${songTitle || 'Untitled'}</h4>
                <p class="text-sm text-gray-600">${artist || 'Unknown Artist'}</p>
            </div>
            ${keyInfo ? `<span class="bg-goodtree-lighter text-goodtree text-xs px-2 py-1 rounded-full">${keyInfo}</span>` : ''}
        `;
        
        container.appendChild(songCard);
    });
}

function displayWorkersTable1(data) {
    const container = document.getElementById('workers-table-1');
    if (!container || !data || data.length < 2) return;
    
    container.innerHTML = `
        <thead>
            <tr>
                <th class="p-2 text-left">Date</th>
                <th class="p-2 text-left">Role</th>
                <th class="p-2 text-left">Name</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    const tbody = container.querySelector('tbody');
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        
        const [date, role, name] = row;
        
        const tr = document.createElement('tr');
        tr.className = i % 2 === 0 ? 'bg-goodtree-lighter/50' : 'bg-white';
        tr.innerHTML = `
            <td class="p-2">${date || '-'}</td>
            <td class="p-2">${role || '-'}</td>
            <td class="p-2 font-medium">${name || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    }
}

function displayWorkersTable2(data) {
    const container = document.getElementById('workers-table-2');
    if (!container || !data || data.length < 2) return;
    
    container.innerHTML = `
        <thead>
            <tr>
                <th class="p-2 text-left">Date</th>
                <th class="p-2 text-left">Role</th>
                <th class="p-2 text-left">Name</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    const tbody = container.querySelector('tbody');
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        
        const [date, role, name] = row;
        
        const tr = document.createElement('tr');
        tr.className = i % 2 === 0 ? 'bg-goodtree-lighter/50' : 'bg-white';
        tr.innerHTML = `
            <td class="p-2">${date || '-'}</td>
            <td class="p-2">${role || '-'}</td>
            <td class="p-2 font-medium">${name || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    }
}

function updateViewCount() {
    // Use fetch to call the Google Apps Script to increment the view count
    fetch(viewCountUrl, {
        method: 'GET',
        mode: 'no-cors'
    }).catch(error => {
        console.error("Error updating view count:", error);
    });
}

// Initialize data fetch when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchSheetData);
