import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPDF(element, filename = 'propuesta.pdf') {
    if (!element) return;

    try {
        // Aseguramos que el elemento sea visible para la captura si es necesario
        // pero preferiblemente ya está en el DOM (aunque oculto fuera de vista)
        const canvas = await html2canvas(element, {
            scale: 2, // Mayor calidad
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2] // Ajustar al tamaño del canvas capturado
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        return true;
    } catch (error) {
        console.error('Error generando PDF:', error);
        return false;
    }
}
