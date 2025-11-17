// Export utility functions for charts and data

/**
 * Export products to PDF
 */
export const exportProductsToPDF = async (products) => {
    if (!products || products.length === 0) {
        throw new Error('No products to export');
    }

    try {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const startY = 20;
        let yPosition = startY;
        const lineHeight = 7;
        const maxWidth = pageWidth - (margin * 2);
        
        // Title
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('Products Export', margin, yPosition);
        yPosition += 10;
        
        // Date
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 8;
        
        // Summary
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Total Products: ${products.length}`, margin, yPosition);
        yPosition += 10;
        
        // Table headers
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const headers = ['Name', 'Category', 'Price', 'Stock', 'Ratings', 'Reviews'];
        const colWidths = [55, 28, 30, 18, 18, 18];
        let xPosition = margin;
        
        // Draw header row
        pdf.setFillColor(147, 51, 234); // Purple color
        pdf.rect(margin, yPosition - 5, maxWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        
        headers.forEach((header, index) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[index];
        });
        
        yPosition += 10;
        pdf.setTextColor(0, 0, 0);
        
        // Product rows
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(9);
        
        products.forEach((product, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = startY;
                
                // Redraw headers on new page
                pdf.setFont(undefined, 'bold');
                pdf.setFillColor(147, 51, 234);
                pdf.rect(margin, yPosition - 5, maxWidth, 8, 'F');
                pdf.setTextColor(255, 255, 255);
                xPosition = margin;
                headers.forEach((header, idx) => {
                    pdf.text(header, xPosition, yPosition);
                    xPosition += colWidths[idx];
                });
                yPosition += 10;
                pdf.setTextColor(0, 0, 0);
                pdf.setFont(undefined, 'normal');
            }
            
            // Alternate row colors
            if (index % 2 === 0) {
                pdf.setFillColor(245, 245, 245);
                pdf.rect(margin, yPosition - 5, maxWidth, lineHeight, 'F');
            }
            
            // Product data
            xPosition = margin;
            const price = product.price || 0;
            const formattedPrice = price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            const rowData = [
                (product.name || 'N/A').substring(0, 28), // Truncate long names
                (product.category || 'N/A').substring(0, 15),
                `$${formattedPrice}`,
                (product.stock || 0).toString(),
                (product.ratings || 0).toFixed(1),
                (product.numOfReviews || 0).toString()
            ];
            
            rowData.forEach((data, idx) => {
                pdf.text(data, xPosition, yPosition);
                xPosition += colWidths[idx];
            });
            
            yPosition += lineHeight;
        });
        
        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Save PDF
        pdf.save(`products_export_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting products to PDF:', error);
        throw error;
    }
};

/**
 * Export chart as image using html2canvas
 */
export const exportChartAsImage = async (chartElementId, filename = 'chart') => {
    try {
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default;
        
        const element = document.getElementById(chartElementId);
        if (!element) {
            throw new Error(`Chart element with id "${chartElementId}" not found`);
        }

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.png`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        }, 'image/png');
    } catch (error) {
        console.error('Error exporting chart:', error);
        throw error;
    }
};

/**
 * Export all charts from dashboard
 */
export const exportAllCharts = async (chartIds) => {
    try {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;
        
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        for (let i = 0; i < chartIds.length; i++) {
            const chartId = chartIds[i];
            const element = document.getElementById(chartId);
            
            if (!element) {
                console.warn(`Chart element with id "${chartId}" not found`);
                continue;
            }

            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add new page if not first chart
            if (i > 0) {
                pdf.addPage();
            }
            
            // Center the image
            const xOffset = 10;
            const yOffset = (pdfHeight - imgHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        }
        
        pdf.save(`dashboard_charts_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting charts:', error);
        throw error;
    }
};

