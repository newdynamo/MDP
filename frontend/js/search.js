/**
 * Co-Fleeter Search Module
 * Global search functionality across vessels, orders, and calculations
 */

class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.searchInput = null;
        this.resultsContainer = null;
        this.isOpen = false;
    }

    /**
     * Initialize search UI and event listeners
     */
    init() {
        // Create search overlay
        this.createSearchUI();

        // Keyboard shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            // ESC to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    createSearchUI() {
        const overlay = document.createElement('div');
        overlay.id = 'search-overlay';
        overlay.className = 'search-overlay hidden';
        overlay.innerHTML = `
            <div class="search-modal">
                <div class="search-header">
                    <input type="text" id="global-search-input" class="search-input" placeholder="Search vessels, orders, calculations... (Ctrl+K)" autofocus>
                    <button class="search-close" onclick="search.close()">×</button>
                </div>
                <div id="search-results" class="search-results">
                    <div class="search-hint">
                        <div class="text-muted text-sm">Start typing to search...</div>
                        <div class="text-xs text-muted mt-2">
                            <kbd>↑</kbd> <kbd>↓</kbd> to navigate &nbsp;
                            <kbd>Enter</kbd> to select &nbsp;
                            <kbd>Esc</kbd> to close
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        this.searchInput = document.getElementById('global-search-input');
        this.resultsContainer = document.getElementById('search-results');

        // Create debounced search function
        const debouncedSearch = performanceUtils.debounce((value) => {
            this.performSearch(value);
        }, 300);

        // Search input event with debounce
        this.searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    }

    /**
     * Build search index from current data
     */
    async buildIndex(user) {
        this.searchIndex = [];

        // Index fleet vessels
        try {
            const fleet = await dataService.getFleet(user);
            fleet.forEach(ship => {
                this.searchIndex.push({
                    type: 'vessel',
                    title: ship.name,
                    subtitle: `${ship.type} • IMO: ${ship.id}`,
                    data: ship,
                    keywords: [ship.name, ship.id, ship.type].join(' ').toLowerCase(),
                    action: () => navigate('fleet')
                });
            });
        } catch (e) {
            console.error('Failed to index fleet:', e);
        }

        // Index trading orders
        try {
            const orders = tradingService.getOrders();
            orders.forEach(order => {
                this.searchIndex.push({
                    type: 'order',
                    title: `${order.type} ${order.symbol}`,
                    subtitle: `${order.quantity} units @ €${order.price.toFixed(2)}`,
                    data: order,
                    keywords: [order.symbol, order.type, order.owner].join(' ').toLowerCase(),
                    action: () => navigate(order.symbol === 'EUA' ? 'trading-ets' : 'trading-fueleu')
                });
            });
        } catch (e) {
            console.error('Failed to index orders:', e);
        }

        // Index calculations
        try {
            const calculations = dataService.getCalculations(user);
            calculations.slice(0, 20).forEach((calc, i) => {
                this.searchIndex.push({
                    type: 'calculation',
                    title: `${calc.type} Calculation`,
                    subtitle: `${new Date(calc.timestamp).toLocaleDateString()} • ${calc.result || 'N/A'}`,
                    data: calc,
                    keywords: [calc.type, calc.result].join(' ').toLowerCase(),
                    action: () => navigate('calculator')
                });
            });
        } catch (e) {
            console.error('Failed to index calculations:', e);
        }
    }

    /**
     * Perform search and display results
     */
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.resultsContainer.innerHTML = `
                <div class="search-hint">
                    <div class="text-muted text-sm">Start typing to search...</div>
                </div>
            `;
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = this.searchIndex.filter(item =>
            item.keywords.includes(lowerQuery)
        ).slice(0, 10);

        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-hint">
                    <div class="text-muted text-sm">No results found for "${query}"</div>
                </div>
            `;
            return;
        }

        const html = results.map((result, index) => `
            <div class="search-result-item" onclick="search.selectResult(${index}, '${query}')" data-index="${index}">
                <div class="search-result-icon">${this.getIcon(result.type)}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${this.highlightMatch(result.title, query)}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
                <div class="search-result-type">${result.type}</div>
            </div>
        `).join('');

        this.resultsContainer.innerHTML = html;
    }

    /**
     * Select a search result
     */
    selectResult(index, query) {
        const lowerQuery = query.toLowerCase();
        const results = this.searchIndex.filter(item =>
            item.keywords.includes(lowerQuery)
        ).slice(0, 10);

        if (results[index]) {
            this.close();
            if (results[index].action) {
                results[index].action();
            }
        }
    }

    /**
     * Highlight matching text
     */
    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Get icon for result type
     */
    getIcon(type) {
        const icons = {
            vessel: '🚢',
            order: '📈',
            calculation: '🧮'
        };
        return icons[type] || '📄';
    }

    /**
     * Open search modal
     */
    async open() {
        const overlay = document.getElementById('search-overlay');
        overlay.classList.remove('hidden');
        this.isOpen = true;

        // Build index with current user
        if (typeof auth !== 'undefined' && auth.currentUser) {
            await this.buildIndex(auth.currentUser);
        }

        // Focus input
        setTimeout(() => {
            this.searchInput.focus();
            this.searchInput.select();
        }, 100);
    }

    /**
     * Close search modal
     */
    close() {
        const overlay = document.getElementById('search-overlay');
        overlay.classList.add('hidden');
        this.isOpen = false;
        this.searchInput.value = '';
        this.resultsContainer.innerHTML = `
            <div class="search-hint">
                <div class="text-muted text-sm">Start typing to search...</div>
            </div>
        `;
    }

    /**
     * Toggle search modal
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Create global instance
const search = new SearchManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => search.init());
} else {
    search.init();
}
