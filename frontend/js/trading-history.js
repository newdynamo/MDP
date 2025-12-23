/**
 * Co-Fleeter Trading History Module
 * Track and display all trading activities
 */

class TradingHistory {
    constructor() {
        count: 0,
            volume: 0,
                value: 0
    };
}

stats.symbols[trade.symbol].count++;
stats.symbols[trade.symbol].volume += trade.quantity;
stats.symbols[trade.symbol].value += trade.quantity * trade.price;
        });

stats.avgPrice = stats.totalVolume > 0
    ? stats.totalValue / stats.totalVolume
    : 0;

return stats;
    }

/**
 * Clear all history
 */
clearHistory() {
    localStorage.removeItem(this.storageKey);
}

/**
 * Export history to CSV
 */
exportToCSV() {
    const history = this.getHistory();

    if (history.length === 0) {
        toast.warning('No trading history to export');
        return;
    }

    const headers = ['Date', 'Time', 'Symbol', 'Type', 'Quantity', 'Price', 'Total', 'Buyer', 'Seller'];
    const rows = history.map(trade => {
        const date = new Date(trade.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            trade.symbol,
            trade.type || 'MATCH',
            trade.quantity,
            trade.price.toFixed(2),
            (trade.quantity * trade.price).toFixed(2),
            trade.buyer || 'N/A',
            trade.seller || 'N/A'
        ];
    });

    const csv = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Trading history exported successfully!');
}
}

// Create global instance
const tradingHistory = new TradingHistory();
