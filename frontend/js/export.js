/**
 * Co-Fleeter Export Module
 * PDF and Excel export functionality
 */

class ExportManager {
    constructor() {
        this.jsPDF = null;
        this.XLSX = null;
    }

    /**
     * Check if libraries are loaded
     */
    checkLibraries() {
        if (typeof window.jspdf === 'undefined') {
            toast.error('PDF library not loaded. Please refresh the page.');
            return false;
        }
        if (typeof XLSX === 'undefined') {
            toast.error('Excel library not loaded. Please refresh the page.');
            return false;
        }
        return true;
    }

    /**
     * Export calculation result to PDF
     * @param {Object} calculation - Calculation data
     */
    exportToPDF(calculation) {
        if (!this.checkLibraries()) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(14, 165, 233); // Primary color
            doc.text('Co-Fleeter Calculation Report', 20, 20);

            // Metadata
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`, 20, 30);
            doc.text(`Type: ${calculation.type} Calculator`, 20, 35);

            // Divider
            doc.setDrawColor(51, 65, 85);
            doc.line(20, 40, 190, 40);

            // Input Parameters
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Input Parameters', 20, 50);

            doc.setFontSize(10);
            let yPos = 60;

            if (calculation.inputs) {
                Object.entries(calculation.inputs).forEach(([key, value]) => {
                    if (typeof value === 'object') return; // Skip objects (like fuelList)
                    const label = this.formatLabel(key);
                    doc.text(`${label}: ${value}`, 25, yPos);
                    yPos += 7;
                });
            }

            // Fuel Data
            if (calculation.fuels && calculation.fuels.length > 0) {
                yPos += 5;
                doc.setFontSize(14);
                doc.text('Fuel Consumption', 20, yPos);
                yPos += 10;

                doc.setFontSize(10);
                calculation.fuels.forEach(fuel => {
                    // Use fuel.class instead of source, handle scope display
                    const scopeStr = (fuel.scope && fuel.scope !== 1) ? `Scope: ${fuel.scope * 100}%` : '';
                    doc.text(`${fuel.class || 'Fuel'} - ${fuel.type}: ${fuel.amount} mT  ${scopeStr}`, 25, yPos);
                    yPos += 7;
                });
            }

            // Results
            yPos += 10;
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129); // Success color
            doc.text('Results', 20, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setTextColor(0);
            if (calculation.result) {
                const lines = doc.splitTextToSize(calculation.result, 170);
                doc.text(lines, 25, yPos);
                yPos += (lines.length * 6) + 10;
            }

            // Additional Details
            if (calculation.details) {
                doc.setFontSize(10);
                Object.entries(calculation.details).forEach(([key, value]) => {
                    doc.text(`${this.formatLabel(key)}: ${value}`, 25, yPos);
                    yPos += 7;
                });
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Co-Fleeter Maritime Decarbonization Platform', 20, 280);
            doc.text('https://co-fleeter.com', 20, 285);

            // Save
            const filename = `cofleeter_${calculation.type}_${Date.now()}.pdf`;
            doc.save(filename);

            toast.success('PDF exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF: ' + error.message);
        }
    }

    /**
     * Export calculation result to Excel
     * @param {Object} calculation - Calculation data
     */
    exportToExcel(calculation) {
        if (!this.checkLibraries()) return;

        try {
            // Prepare data for Excel
            const data = [];

            // Header
            data.push(['Co-Fleeter Calculation Report']);
            data.push([]);
            data.push(['Generated:', new Date().toLocaleString()]);
            data.push(['Type:', calculation.type]);
            data.push([]);

            // Input Parameters
            data.push(['Input Parameters']);
            if (calculation.inputs) {
                Object.entries(calculation.inputs).forEach(([key, value]) => {
                    data.push([this.formatLabel(key), value]);
                });
            }
            data.push([]);

            // Fuel Data
            if (calculation.fuels && calculation.fuels.length > 0) {
                data.push(['Fuel Consumption']);
                data.push(['Source', 'Type', 'Amount (mT)', 'Scope']);
                calculation.fuels.forEach(fuel => {
                    data.push([fuel.source, fuel.type, fuel.amount, fuel.scope || '100%']);
                });
                data.push([]);
            }

            // Results
            data.push(['Results']);
            if (calculation.result) {
                data.push(['Result', calculation.result]);
            }
            if (calculation.details) {
                Object.entries(calculation.details).forEach(([key, value]) => {
                    data.push([this.formatLabel(key), value]);
                });
            }

            // Create workbook
            const ws = XLSX.utils.aoa_to_sheet(data);

            // Set column widths
            ws['!cols'] = [
                { wch: 30 },
                { wch: 20 },
                { wch: 15 },
                { wch: 15 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Calculation');

            // Save
            const filename = `cofleeter_${calculation.type}_${Date.now()}.xlsx`;
            XLSX.writeFile(wb, filename);

            toast.success('Excel file exported successfully!');
        } catch (error) {
            console.error('Excel export error:', error);
            toast.error('Failed to export Excel: ' + error.message);
        }
    }

    /**
     * Export fleet data to Excel
     * @param {Array} fleet - Fleet data
     */
    exportFleetToExcel(fleet) {
        if (!this.checkLibraries()) return;

        try {
            const data = [];

            // Header
            data.push(['Co-Fleeter Fleet Report']);
            data.push([]);
            data.push(['Generated:', new Date().toLocaleString()]);
            data.push(['Total Vessels:', fleet.length]);
            data.push([]);

            // Column headers
            data.push(['Vessel Name', 'IMO Number', 'Type', 'DWT', 'Year', 'CII Rating', 'YTD CO2 (mT)']);

            // Fleet data
            fleet.forEach(ship => {
                data.push([
                    ship.name,
                    ship.id,
                    ship.type,
                    ship.dwt,
                    ship.year,
                    ship.cii_rating || 'N/A',
                    ship.co2_ytd || 0
                ]);
            });

            // Create workbook
            const ws = XLSX.utils.aoa_to_sheet(data);
            ws['!cols'] = [
                { wch: 20 },
                { wch: 15 },
                { wch: 15 },
                { wch: 10 },
                { wch: 8 },
                { wch: 12 },
                { wch: 15 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Fleet');

            // Save
            const filename = `cofleeter_fleet_${Date.now()}.xlsx`;
            XLSX.writeFile(wb, filename);

            toast.success('Fleet data exported successfully!');
        } catch (error) {
            console.error('Fleet export error:', error);
            toast.error('Failed to export fleet data: ' + error.message);
        }
    }

    /**
     * Format label for display
     */
    formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Create global instance
const exportManager = new ExportManager();
