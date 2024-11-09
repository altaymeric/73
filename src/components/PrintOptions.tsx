import React, { useState } from 'react';
import { Payment } from '../types/payment';
import PrintPreviewModal from './PrintPreviewModal';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { exportToPdf } from '../utils/pdfExport';

interface PrintOptionsProps {
  payments: Payment[];
}

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

function ErrorDialog({ isOpen, onClose, message }: ErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-md transform bg-white rounded-lg shadow-xl">
          <div className="bg-red-50 p-6 rounded-t-lg border-b border-red-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Hata</h3>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-sm text-gray-600">
              <p>{message}</p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintOptions({ payments }: PrintOptionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleExcelExport = async () => {
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
      setShowMenu(false);
    } catch (error) {
      setErrorMessage('Excel dosyası oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setShowError(true);
    }
  };

  const handlePdfExport = async () => {
    try {
      await exportToPdf(payments);
      setShowMenu(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setShowError(true);
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPreview(false);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-[38px]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>Yazdır</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-blue-600 ring-1 ring-blue-700 z-50">
          <div className="py-1">
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Önizleme</span>
            </button>
            <button
              onClick={handleExcelExport}
              className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Excel</span>
            </button>
            <button
              onClick={handlePdfExport}
              className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>PDF</span>
            </button>
          </div>
        </div>
      )}

      <PrintPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        payments={payments}
        title="Ödeme Listesi"
        totalAmount={payments.reduce((sum, payment) => sum + payment.amount, 0)}
      />

      <ErrorDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />

      {showMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
}