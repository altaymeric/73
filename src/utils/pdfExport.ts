import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Payment } from '../types/payment';

export const exportToPdf = async (payments: Payment[]): Promise<void> => {
  try {
    // Create new document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set document properties
    doc.setProperties({
      title: 'Ödeme Takip Raporu',
      subject: 'Ödeme Listesi',
      author: 'Altay Ödeme Takip Sistemi',
      keywords: 'ödemeler, çekler, raporlar',
      creator: 'Altay Ödeme Takip'
    });

    // Add header
    doc.setFontSize(16);
    doc.text('ÖDEME TAKİP RAPORU', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    // Add date
    doc.setFontSize(10);
    doc.text(`Olusturma Tarihi: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 15, 25);

    // Calculate summary data
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    // Add summary table
    const summaryData = [
      ['Toplam Odeme:', `${payments.length} adet`],
      ['Toplam Tutar:', `${totalAmount.toLocaleString('tr-TR')} TL`],
      ['Odenen:', `${paidAmount.toLocaleString('tr-TR')} TL`],
      ['Kalan:', `${pendingAmount.toLocaleString('tr-TR')} TL`]
    ];

    autoTable(doc, {
      startY: 30,
      head: [['OZET BILGILER', '']],
      body: summaryData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 }
      }
    });

    // Convert Turkish characters to their ASCII equivalents
    const convertTurkishChars = (text: string) => {
      return text
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C');
    };

    // Prepare main table data
    const tableData = payments.map(payment => [
      format(payment.dueDate, 'dd.MM.yyyy'),
      payment.checkNumber,
      convertTurkishChars(payment.bank),
      convertTurkishChars(payment.company),
      convertTurkishChars(payment.businessGroup),
      convertTurkishChars(payment.description),
      payment.amount.toLocaleString('tr-TR'),
      payment.status === 'paid' ? 'Odendi' : 'Odenmedi'
    ]);

    // Add main table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Vade', 'Cek No', 'Banka', 'Firma', 'Is Grubu', 'Aciklama', 'Tutar', 'Durum']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 50 },
        6: { cellWidth: 25, halign: 'right' },
        7: { cellWidth: 20, halign: 'center' }
      },
      didDrawPage: (data) => {
        // Add page number
        doc.setFontSize(8);
        doc.text(
          `Sayfa ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10
        );
      },
      willDrawCell: (data) => {
        // Highlight paid payments
        if (data.section === 'body' && data.cell.raw === 'Odendi') {
          data.cell.styles.textColor = [220, 0, 0];
        }
      }
    });

    // Save the PDF
    doc.save(`odeme_raporu_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
  } catch (error) {
    console.error('PDF disa aktarma hatasi:', error);
    throw new Error('PDF dosyasi olusturulurken bir hata olustu. Lutfen tekrar deneyin.');
  }
};