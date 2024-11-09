import React, { useState } from 'react';
import { Payment } from '../types/payment';
import { format, isThisMonth } from 'date-fns';
import PrintPreviewModal from './PrintPreviewModal';
import { exportToPdf } from '../utils/pdfExport';
import * as XLSX from 'xlsx';

interface PaymentSummaryProps {
  payments: Payment[];
}

interface BankTotal {
  bank: string;
  amount: number;
}

interface PrintMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onPrintPreview: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

function PrintMenu({ position, onClose, onPrintPreview, onExportPdf, onExportExcel }: PrintMenuProps) {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg py-1 w-48"
      style={{ top: position.y, left: position.x }}
    >
      <button
        onClick={() => {
          onPrintPreview();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Önizleme
      </button>
      <button
        onClick={() => {
          onExportPdf();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF
      </button>
      <button
        onClick={() => {
          onExportExcel();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
    </div>
  );
}

export default function PaymentSummary({ payments }: PaymentSummaryProps) {
  const [printMenuPosition, setPrintMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  
  // Calculate current month totals
  const currentMonthPayments = payments.filter(payment => isThisMonth(payment.dueDate));
  const currentMonthTotal = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonthPaid = currentMonthPayments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const currentMonthRemaining = currentMonthTotal - currentMonthPaid;

  // Calculate and sort bank totals for all payments
  const allBankTotals = Object.entries(payments.reduce((acc, payment) => {
    acc[payment.bank] = (acc[payment.bank] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>))
    .map(([bank, amount]): BankTotal => ({ bank, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate and sort bank totals for paid payments
  const paidBankTotals = Object.entries(payments
    .filter(payment => payment.status === 'paid')
    .reduce((acc, payment) => {
      acc[payment.bank] = (acc[payment.bank] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>))
    .map(([bank, amount]): BankTotal => ({ bank, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate and sort bank totals for remaining payments
  const remainingBankTotals = Object.entries(payments
    .filter(payment => payment.status === 'pending')
    .reduce((acc, payment) => {
      acc[payment.bank] = (acc[payment.bank] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>))
    .map(([bank, amount]): BankTotal => ({ bank, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate and sort bank totals for current month
  const currentMonthBankTotals = Object.entries(currentMonthPayments
    .reduce((acc, payment) => {
      acc[payment.bank] = (acc[payment.bank] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>))
    .map(([bank, amount]): BankTotal => ({ bank, amount }))
    .sort((a, b) => b.amount - a.amount);

  const handlePrintClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPrintMenuPosition({
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handleExportExcel = () => {
    try {
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

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Ödemeler');
      XLSX.writeFile(wb, `odemeler_${format(new Date(), 'dd_MM_yyyy')}.xlsx`);
    } catch (error) {
      alert('Excel dosyası oluşturulurken bir hata oluştu.');
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPreview(false);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Toplam Tutar</h3>
            <button
              onClick={handlePrintClick}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-3">
            {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
          <div className="border-t pt-2 space-y-1">
            {allBankTotals.map(({ bank, amount }) => (
              <div key={bank} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{bank}:</span>
                <span className="font-medium text-blue-600">
                  {amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ödenen</h3>
          <p className="text-2xl font-bold text-green-600 mb-3">
            {paidAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
          <div className="border-t pt-2 space-y-1">
            {paidBankTotals.map(({ bank, amount }) => (
              <div key={bank} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{bank}:</span>
                <span className="font-medium text-green-600">
                  {amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Kalan</h3>
          <p className="text-2xl font-bold text-red-600 mb-3">
            {remainingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
          <div className="border-t pt-2 space-y-1">
            {remainingBankTotals.map(({ bank, amount }) => (
              <div key={bank} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{bank}:</span>
                <span className="font-medium text-red-600">
                  {amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bu Ay Toplam</h3>
          <p className="text-2xl font-bold text-purple-600 mb-3">
            {currentMonthTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
          
          <div className="mb-3 space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Ödenen:</span>
              <span className="font-medium text-green-600">
                {currentMonthPaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Kalan:</span>
              <span className="font-medium text-red-600">
                {currentMonthRemaining.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
          </div>

          <div className="border-t pt-2 space-y-1">
            {currentMonthBankTotals.map(({ bank, amount }) => (
              <div key={bank} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{bank}:</span>
                <span className="font-medium text-purple-600">
                  {amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PrintMenu
        position={printMenuPosition}
        onClose={() => setPrintMenuPosition(null)}
        onPrintPreview={() => setShowPreview(true)}
        onExportPdf={() => exportToPdf(payments)}
        onExportExcel={handleExportExcel}
      />

      <PrintPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        payments={payments}
        title="Ödeme Listesi"
        totalAmount={totalAmount}
      />

      {printMenuPosition && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setPrintMenuPosition(null)}
        ></div>
      )}
    </>
  );
}