import React from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Payment } from '../types/payment';

interface ExcelExportProps {
  payments: Payment[];
}

export default function ExcelExport({ payments }: ExcelExportProps) {
  const handleExport = () => {
    try {
      // Excel için veriyi hazırla
      const data = payments.map(payment => ({
        'Vade Tarihi': format(payment.dueDate, 'dd.MM.yyyy'),
        'Çek No': payment.checkNumber,
        'Banka': payment.bank,
        'Firma': payment.company,
        'İş Grubu': payment.businessGroup,
        'Açıklama': payment.description,
        'Tutar': payment.amount.toLocaleString('tr-TR'),
        'Durum': payment.status === 'paid' ? 'Ödendi' : 'Ödenmedi'
      }));

      // Excel çalışma kitabı oluştur
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data, {
        header: [
          'Vade Tarihi',
          'Çek No',
          'Banka',
          'Firma',
          'İş Grubu',
          'Açıklama',
          'Tutar',
          'Durum'
        ]
      });

      // Sütun genişliklerini ayarla
      ws['!cols'] = [
        { wch: 12 }, // Vade Tarihi
        { wch: 15 }, // Çek No
        { wch: 20 }, // Banka
        { wch: 20 }, // Firma
        { wch: 15 }, // İş Grubu
        { wch: 30 }, // Açıklama
        { wch: 15 }, // Tutar
        { wch: 10 }  // Durum
      ];

      // Çalışma sayfasını kitaba ekle
      XLSX.utils.book_append_sheet(wb, ws, 'Ödemeler');

      // Dosyayı kaydet
      const fileName = `odemeler_${format(new Date(), 'dd_MM_yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Başarı mesajı göster
      alert('Excel dosyası başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Excel dışa aktarma hatası:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Excel'e Aktar</span>
    </button>
  );
}