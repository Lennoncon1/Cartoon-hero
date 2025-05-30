// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // --- Global State & Constants ---
    let portfolio = []; // Array to hold stock objects
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Placeholder

    // --- DOM Elements ---
    const addStockForm = document.getElementById('add-stock-form');
    const holdingsTableBody = document.getElementById('holdings-table-body');
    const totalPortfolioValueEl = document.getElementById('total-portfolio-value');
    const estimatedAnnualDividendsEl = document.getElementById('estimated-annual-dividends');
    const analysisStockSelect = document.getElementById('analysis-stock-select');

    // Modal elements
    const customModal = document.getElementById('custom-modal');
    const modalTitleEl = document.getElementById('modal-title');
    const modalMessageEl = document.getElementById('modal-message');
    const modalConfirmButton = document.getElementById('modal-confirm-button');
    const modalCancelButton = document.getElementById('modal-cancel-button');
    let currentConfirmCallback = null;

    // --- Initialization ---
    loadPortfolio();
    renderPortfolio();
    // Placeholder for initial Gemini feature loads (e.g., Stock Fact of the Day)
    // fetchStockFact(); 

    // --- Core Portfolio Functions ---

    function loadPortfolio() {
        const storedPortfolio = localStorage.getItem('stockPortfolio');
        if (storedPortfolio) {
            portfolio = JSON.parse(storedPortfolio);
        }
    }

    function savePortfolio() {
        localStorage.setItem('stockPortfolio', JSON.stringify(portfolio));
    }

    function simulateCurrentPrice(purchasePrice) {
        // Simulate a price fluctuation (e.g., -10% to +10% of purchase price)
        const fluctuation = (Math.random() * 0.2) - 0.1; // Random number between -0.1 and 0.1
        let currentPrice = purchasePrice * (1 + fluctuation);
        return Math.max(0, currentPrice); // Ensure price doesn't go below 0
    }

    function renderPortfolio() {
        holdingsTableBody.innerHTML = ''; // Clear existing rows
        analysisStockSelect.innerHTML = '<option value="">Select a stock to analyze...</option>'; // Clear and add default

        if (portfolio.length === 0) {
            const row = holdingsTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 9; // Number of columns in the table
            cell.textContent = 'No stocks in your portfolio yet. Add some!';
            cell.className = 'text-center text-gray-500 py-4';
        } else {
            portfolio.forEach((stock, index) => {
                const currentPrice = simulateCurrentPrice(parseFloat(stock.purchasePrice));
                const totalValue = currentPrice * parseFloat(stock.quantity);

                const row = holdingsTableBody.insertRow();
                row.insertCell().textContent = stock.name;
                row.insertCell().textContent = stock.quantity;
                row.insertCell().textContent = `$${parseFloat(stock.purchasePrice).toFixed(2)}`;
                row.insertCell().textContent = `$${currentPrice.toFixed(2)}`;
                row.insertCell().textContent = `$${totalValue.toFixed(2)}`;
                row.insertCell().textContent = stock.dividendYield ? `$${parseFloat(stock.dividendYield).toFixed(2)}` : 'N/A';
                row.insertCell().textContent = stock.exDividendDate || 'N/A';
                row.insertCell().textContent = stock.earningsDate || 'N/A';
                
                const actionsCell = row.insertCell();
                actionsCell.className = 'text-center';
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded';
                deleteButton.onclick = () => {
                    showModal(
                        `Are you sure you want to delete ${stock.name}?`,
                        () => deleteStock(index)
                    );
                };
                actionsCell.appendChild(deleteButton);

                // Add stock to analysis dropdown
                const option = document.createElement('option');
                option.value = stock.name; // Or a unique ID if available
                option.textContent = stock.name;
                analysisStockSelect.appendChild(option);
            });
        }
        updatePortfolioSummary();
    }

    function addStock(event) {
        event.preventDefault();
        const newStock = {
            name: document.getElementById('stock-name').value.trim(),
            quantity: parseFloat(document.getElementById('stock-quantity').value),
            purchasePrice: parseFloat(document.getElementById('purchase-price').value),
            dividendYield: parseFloat(document.getElementById('dividend-yield').value) || 0,
            exDividendDate: document.getElementById('ex-dividend-date').value,
            earningsDate: document.getElementById('earnings-date').value,
        };

        if (!newStock.name || isNaN(newStock.quantity) || isNaN(newStock.purchasePrice)) {
            alert("Please fill in all required fields (Stock Name, Quantity, Purchase Price).");
            return;
        }
        
        // Check if stock already exists (simple check by name)
        if (portfolio.some(stock => stock.name.toLowerCase() === newStock.name.toLowerCase())) {
            alert(`Stock "${newStock.name}" is already in your portfolio.`);
            return;
        }

        portfolio.push(newStock);
        savePortfolio();
        renderPortfolio();
        addStockForm.reset(); // Reset form fields
    }

    function deleteStock(stockIndex) {
        if (stockIndex >= 0 && stockIndex < portfolio.length) {
            portfolio.splice(stockIndex, 1);
            savePortfolio();
            renderPortfolio();
        }
        hideModal();
    }

    function updatePortfolioSummary() {
        let totalValue = 0;
        let totalAnnualDividends = 0;

        portfolio.forEach(stock => {
            const currentPrice = simulateCurrentPrice(parseFloat(stock.purchasePrice));
            totalValue += currentPrice * parseFloat(stock.quantity);
            if (stock.dividendYield) {
                totalAnnualDividends += parseFloat(stock.dividendYield) * parseFloat(stock.quantity);
            }
        });

        totalPortfolioValueEl.textContent = `$${totalValue.toFixed(2)}`;
        estimatedAnnualDividendsEl.textContent = `$${totalAnnualDividends.toFixed(2)}`;
    }
    
    // --- Modal Functions ---
    function showModal(message, onConfirmCallback) {
        modalMessageEl.textContent = message;
        currentConfirmCallback = onConfirmCallback;
        customModal.classList.remove('hidden');
    }

    function hideModal() {
        customModal.classList.add('hidden');
        currentConfirmCallback = null;
    }

    // --- Event Listeners ---
    if (addStockForm) {
        addStockForm.addEventListener('submit', addStock);
    }

    if (modalConfirmButton) {
        modalConfirmButton.addEventListener('click', () => {
            if (currentConfirmCallback) {
                currentConfirmCallback();
            }
        });
    }

    if (modalCancelButton) {
        modalCancelButton.addEventListener('click', hideModal);
    }

    // --- Periodic Updates (Example: Refresh prices every 30 seconds) ---
    // setInterval(() => {
    //     if (portfolio.length > 0) {
    //         renderPortfolio(); // This will re-simulate prices and update summary
    //         console.log("Simulated prices updated.");
    //     }
    // }, 30000); // 30 seconds

    // --- Placeholder for Gemini API functions (to be implemented in Part 2) ---
    // window.fetchStockFact = async function() { /* ... */ };
    // window.fetchStockAnalysis = async function() { /* ... */ };
    // window.fetchInvestmentStrategy = async function() { /* ... */ };
    // window.fetchGlossaryTerm = async function() { /* ... */ };

// --- DOM Elements for Gemini Features (ensure these are defined if not already) ---
const stockFactContentEl = document.getElementById('stock-fact-content');
const stockFactLoaderEl = document.getElementById('stock-fact-loader');

const analysisStockSelectEl = document.getElementById('analysis-stock-select'); // Already defined
const analyzeStockButton = document.getElementById('analyze-stock-button');
const stockAnalysisContentEl = document.getElementById('stock-analysis-content');
const stockAnalysisLoaderEl = document.getElementById('stock-analysis-loader');

const riskToleranceSelect = document.getElementById('risk-tolerance');
const investmentHorizonInput = document.getElementById('investment-horizon');
const getStrategyButton = document.getElementById('get-strategy-button');
const investmentStrategyContentEl = document.getElementById('investment-strategy-content');
const investmentStrategyLoaderEl = document.getElementById('investment-strategy-loader');

const financialTermInput = document.getElementById('financial-term');
const lookupTermButton = document.getElementById('lookup-term-button');
const glossaryContentEl = document.getElementById('glossary-content');
const glossaryLoaderEl = document.getElementById('glossary-loader');

// --- Gemini API Feature Functions ---

// Simulated Gemini API call function
async function simulateGeminiApiCall(prompt, loadingEl, contentEl, mockResponseGenerator) {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.textContent = 'Thinking...';

    // console.log("Simulating Gemini API call with prompt:", prompt);
    // In a real app:
    // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    // });
    // if (!response.ok) {
    //   throw new Error(`API call failed: ${response.statusText}`);
    // }
    // const data = await response.json();
    // const text = data.candidates[0].content.parts[0].text;

    return new Promise(resolve => {
        setTimeout(() => {
            if (loadingEl) loadingEl.classList.add('hidden');
            const text = mockResponseGenerator(prompt);
            if (contentEl) contentEl.textContent = text;
            resolve(text);
        }, 1500); // Simulate network delay
    });
}

async function fetchStockFact() {
    const prompt = "Tell me an interesting stock market fact.";
    function mockResponse() {
        const facts = [
            "The New York Stock Exchange (NYSE) started in 1792 under a buttonwood tree.",
            "The term 'bear market' might come from bears swiping downwards, 'bull market' from bulls thrusting horns upwards.",
            "Only about 10% of daily trades are done by retail investors; the rest are institutional.",
            "Warren Buffett bought his first stock at age 11.",
            "The most expensive stock ever (Berkshire Hathaway Class A) traded for over $600,000 per share."
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }
    try {
        await simulateGeminiApiCall(prompt, stockFactLoaderEl, stockFactContentEl, mockResponse);
    } catch (error) {
        console.error("Error fetching stock fact:", error);
        if (stockFactContentEl) stockFactContentEl.textContent = "Could not load stock fact at this time.";
        if (stockFactLoaderEl) stockFactLoaderEl.classList.add('hidden');
    }
}

async function fetchStockAnalysis() {
    const selectedStockName = analysisStockSelectEl.value;
    if (!selectedStockName) {
        stockAnalysisContentEl.textContent = "Please select a stock to analyze.";
        return;
    }
    const prompt = `Provide a brief analysis for the stock: ${selectedStockName}. Keep it concise (2-3 sentences).`;
    
    function mockResponse(p) {
        const stockName = p.split(": ")[1].split(".")[0]; // Extract stock name from prompt
        const analyses = [
            `${stockName} is showing strong growth potential due to recent product innovations and expanding market share. However, watch out for increased competition.`,
            `Considered a stable dividend payer, ${stockName} is favored by income investors. Its P/E ratio is currently above industry average, suggesting it might be slightly overvalued.`,
            `${stockName} has high volatility but could offer significant returns if its upcoming projects succeed. Recommended for investors with a higher risk tolerance.`,
        ];
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    try {
        await simulateGeminiApiCall(prompt, stockAnalysisLoaderEl, stockAnalysisContentEl, mockResponse);
    } catch (error) {
        console.error("Error fetching stock analysis:", error);
        stockAnalysisContentEl.textContent = "Could not perform analysis at this time.";
        if (stockAnalysisLoaderEl) stockAnalysisLoaderEl.classList.add('hidden');
    }
}

async function fetchInvestmentStrategy() {
    const risk = riskToleranceSelect.value;
    const horizon = investmentHorizonInput.value;
    if (!horizon || parseInt(horizon) < 1) {
        investmentStrategyContentEl.textContent = "Please enter a valid investment horizon (at least 1 year).";
        return;
    }

    const prompt = `Suggest a high-level investment strategy for someone with ${risk} risk tolerance and an investment horizon of ${horizon} years. Focus on general principles and asset allocation, not specific stocks.`;
    
    function mockResponse(p) {
        // Basic mock, a real API would give more nuanced results
        if (p.includes("Low risk") && parseInt(horizon) < 5) return "Focus on capital preservation: consider short-term bonds, high-yield savings, and a small portion in blue-chip dividend stocks.";
        if (p.includes("Low risk")) return "With a ${risk} risk tolerance and ${horizon}-year horizon, consider a diversified portfolio of bonds (60%), blue-chip stocks (30%), and cash (10%). Prioritize stability and income.";
        if (p.includes("Medium risk") && parseInt(horizon) < 5) return "A balanced approach: mix growth stocks (40%), index funds (40%), and some bonds (20%). Rebalance periodically.";
        if (p.includes("Medium risk")) return "For a ${risk} risk tolerance over ${horizon} years, aim for a mix of growth stocks (50-60%), ETFs tracking major indices (30-40%), and a smaller portion in bonds (10-20%).";
        if (p.includes("High risk") && parseInt(horizon) < 5) return "Aggressive growth: focus on small-cap stocks, emerging markets, and sector-specific ETFs. Understand the higher volatility involved.";
        if (p.includes("High risk")) return "Given your ${risk} risk tolerance and ${horizon}-year horizon, you can afford to take on more risk for potentially higher returns. Consider a portfolio heavily weighted in growth stocks (70-80%), with some allocation to international equities and possibly alternative investments (20-30%).";
        return "A diversified approach is generally recommended. Consult a financial advisor for personalized advice.";
    }

    try {
        await simulateGeminiApiCall(prompt, investmentStrategyLoaderEl, investmentStrategyContentEl, mockResponse);
    } catch (error) {
        console.error("Error fetching investment strategy:", error);
        investmentStrategyContentEl.textContent = "Could not generate strategy at this time.";
        if (investmentStrategyLoaderEl) investmentStrategyLoaderEl.classList.add('hidden');
    }
}

async function fetchGlossaryTerm() {
    const term = financialTermInput.value.trim();
    if (!term) {
        glossaryContentEl.textContent = "Please enter a financial term to look up.";
        return;
    }
    const prompt = `Define the financial term: "${term}" in a simple, concise way (1-2 sentences).`;
    
    function mockResponse(p) {
        const t = p.split('"')[1]; // Extract term
        const definitions = {
            "bull market": "A bull market is when stock prices are generally rising, and market sentiment is optimistic.",
            "bear market": "A bear market is characterized by falling stock prices and widespread pessimism.",
            "dividend": "A dividend is a distribution of a portion of a company's earnings to its shareholders, typically paid in cash.",
            "p/e ratio": "The Price-to-Earnings (P/E) ratio is a company's stock price divided by its earnings per share. It helps investors gauge if a stock is over or undervalued.",
            "etf": "An Exchange-Traded Fund (ETF) is a type of investment fund that holds assets like stocks or bonds and trades on stock exchanges, similar to a stock."
        };
        return definitions[t.toLowerCase()] || `Sorry, I don't have a definition for "${t}" in my mock data. A real API would provide this.`;
    }

    try {
        await simulateGeminiApiCall(prompt, glossaryLoaderEl, glossaryContentEl, mockResponse);
    } catch (error) {
        console.error("Error fetching glossary term:", error);
        glossaryContentEl.textContent = "Could not look up term at this time.";
        if (glossaryLoaderEl) glossaryLoaderEl.classList.add('hidden');
    }
}

// --- Event Listeners for Gemini Features ---
if (analyzeStockButton) {
    analyzeStockButton.addEventListener('click', fetchStockAnalysis);
}
if (getStrategyButton) {
    getStrategyButton.addEventListener('click', fetchInvestmentStrategy);
}
if (lookupTermButton) {
    lookupTermButton.addEventListener('click', fetchGlossaryTerm);
}

// --- Initial Load for Stock Fact ---
fetchStockFact(); // Load a stock fact when the app starts

});
