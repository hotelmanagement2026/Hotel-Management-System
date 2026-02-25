import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (invoice) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            // Ensure directory exists
            const invoiceDir = path.join(process.cwd(), 'public', 'invoices');
            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            const fileName = `${invoice.invoiceNumber}.pdf`;
            const filePath = path.join(invoiceDir, fileName);
            const relativeUrl = `/invoices/${fileName}`;

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- Header ---
            doc.fillColor('#444444')
                .fontSize(20)
                .text('LUMIÈRE LUXURY HOTELS', 50, 57)
                .fontSize(10)
                .text('123 Luxury Avenue, Paradise City, India', 200, 65, { align: 'right' })
                .text('GSTIN: 27AABCU9603R1ZN', 200, 80, { align: 'right' })
                .moveDown();

            doc.fillColor('#000000')
                .fontSize(20)
                .text('TAX INVOICE', 50, 120, { align: 'center' });

            // --- Invoice Details ---
            doc.fontSize(10)
                .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 160)
                .text(`Invoice Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 175)
                .text(`Booking ID: ${invoice.bookingId}`, 50, 190)

                .text(`Bill To: ${invoice.customerDetails.name}`, 300, 160)
                .text(`Email: ${invoice.customerDetails.email}`, 300, 175)
                .text(invoice.customerDetails.gstin ? `GSTIN: ${invoice.customerDetails.gstin}` : '', 300, 190);

            // --- Table Header ---
            const tableTop = 230;
            doc.font('Helvetica-Bold');
            generateTableRow(doc, tableTop, 'Description', 'Rate', 'Qty', 'Amount');
            generateHr(doc, tableTop + 20);
            doc.font('Helvetica');

            // --- Line Items ---
            let i = 0;
            invoice.lineItems.forEach((item, index) => {
                const position = tableTop + (index + 1) * 30;
                generateTableRow(
                    doc,
                    position,
                    item.description,
                    formatCurrency(item.pricePerNight),
                    item.nights,
                    formatCurrency(item.amount)
                );
                generateHr(doc, position + 20);
                i = index + 1;
            });

            // --- Totals ---
            const subtotalPosition = tableTop + (i + 1) * 30;

            doc.font('Helvetica-Bold');
            generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', formatCurrency(invoice.subtotal));

            let currentPos = subtotalPosition + 25;

            // Discounts
            if (invoice.discountAmount > 0) {
                generateTableRow(doc, currentPos, '', '', 'Discount', `-${formatCurrency(invoice.discountAmount)}`);
                currentPos += 20;
            }

            // Tax
            if (invoice.taxDetails.totalTax > 0) {
                if (invoice.taxDetails.igst.amount > 0) {
                    generateTableRow(doc, currentPos, '', '', `IGST (${invoice.taxDetails.igst.percentage}%)`, formatCurrency(invoice.taxDetails.igst.amount));
                    currentPos += 20;
                } else {
                    generateTableRow(doc, currentPos, '', '', `CGST (${invoice.taxDetails.cgst.percentage}%)`, formatCurrency(invoice.taxDetails.cgst.amount));
                    currentPos += 20;
                    generateTableRow(doc, currentPos, '', '', `SGST (${invoice.taxDetails.sgst.percentage}%)`, formatCurrency(invoice.taxDetails.sgst.amount));
                    currentPos += 20;
                }
            }

            // Grand Total
            doc.fontSize(12)
                .fillColor('#AA8F66') // Goldish
                .text(`Grand Total: ${formatCurrency(invoice.grandTotal)}`, 350, currentPos + 10, { width: 200, align: 'right' });

            // Payment Status
            doc.fontSize(14)
                .fillColor(invoice.paymentStatus === 'paid' ? '#008000' : '#FF0000')
                .text(invoice.paymentStatus.toUpperCase(), 50, currentPos + 10);

            // --- Footer ---
            doc.fontSize(10)
                .fillColor('#444444')
                .text('Thank you for choosing Lumière Luxury Hotels.', 50, 700, { align: 'center', width: 500 });

            doc.end();

            stream.on('finish', () => {
                resolve(relativeUrl);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Helper Functions
function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateTableRow(doc, y, description, rate, qty, lineTotal) {
    doc.fontSize(10)
        .text(description, 50, y)
        .text(rate, 280, y, { width: 90, align: 'right' })
        .text(qty, 370, y, { width: 90, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' });
}

function formatCurrency(amount) {
    return '₹' + (amount).toFixed(2);
}
