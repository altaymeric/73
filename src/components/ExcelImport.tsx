import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Payment } from '../types/payment';
import { parse, isValid, isBefore, startOfDay } from 'date-fns';

interface ExcelImportProps {
  onImport: (payments: Payment[]) => void;
}

interface ImportSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  totalAmount: number;
}

function ImportSuccessDialog({ isOpen, onClose, count, totalAmount }: ImportSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-md transform bg-white rounded-lg shadow-xl">
          <div className="bg-green-50 p-6 rounded-t-lg border-b border-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Aktarım Başarılı</h3>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-sm text-gray-600">
              <p>Excel dosyasından <span className="font-semibold text-gray-900">{count}</span> adet ödeme başarıyla aktarıldı.</p>
              <p className="mt-2">Toplam Tutar: <span className="font-semibold text-gray-900">{totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span></p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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

interface PastDuePaymentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pastDueCount: number;
  totalAmount: number;
}

function PastDuePaymentsDialog({ isOpen, onClose, onConfirm, pastDueCount, totalAmount }: PastDuePaymentsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-md transform bg-white rounded-lg shadow-xl">
          <div className="bg-yellow-50 p-6 rounded-t-lg border-b border-yellow-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Vadesi Geçmiş Ödemeler</h3>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-sm text-gray-600">
              <p>Excel dosyasında <span className="font-semibold text-gray-900">{pastDueCount}</span> adet vadesi geçmiş ödeme bulunmaktadır.</p>
              <p className="mt-2">Toplam Tutar: <span className="font-semibold text-gray-900">{totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span></p>
              <p className="mt-4">Bu ödemeleri otomatik olarak "Ödendi" durumuna getirmek ister misiniz?</p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hayır
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Evet, Ödenmiş Olarak İşaretle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPastDueDialog, setShowPastDueDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [importData, setImportData] = useState<{
    payments: Array<Omit<Payment, 'id'>>,
    pastDuePayments: number[],
    pastDueAmount: number,
    totalAmount: number
  } | null>(null);

  const parseExcelDate = (value: any): Date => {
    if (!value) return new Date();

    if (typeof value === 'number') {
      const date = new Date((value - (25567 + 2)) * 86400 * 1000);
      if (isValid(date)) return date;
    }

    if (typeof value === 'string') {
      const formats = ['dd.MM.yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
      for (const format of formats) {
        const parsedDate = parse(value, format, new Date());
        if (isValid(parsedDate)) return parsedDate;
      }
    }

    return new Date();
  };

  const processImportedData = (data: any[][]) => {
    if (data.length < 2) {
      throw new Error('Excel dosyasında veri bulunamadı');
    }

    const expectedColumns = [
      'Vade Tarihi',
      'Çek No',
      'Banka',
      'Firma',
      'İş Grubu',
      'Açıklama',
      'Tutar'
    ];

    const headers = (data[0] as any[]).map(h => String(h).trim());
    
    const isValidColumnOrder = expectedColumns.every((col, index) => 
      headers[index]?.toLowerCase() === col.toLowerCase()
    );

    if (!isValidColumnOrder) {
      throw new Error(`Excel dosyası beklenen sütun sırasına sahip olmalıdır:\n${expectedColumns.join(', ')}`);
    }

    const today = startOfDay(new Date());
    const pastDueIndices: number[] = [];
    let pastDueTotal = 0;
    let totalAmount = 0;

    const payments = (data as any[][]).slice(1)
      .filter(row => row.length >= expectedColumns.length)
      .map((row, index) => {
        const dueDate = parseExcelDate(row[0]);
        const amount = typeof row[6] === 'number' ? row[6] : parseFloat(String(row[6]).replace(/[^\d.-]/g, ''));
        
        totalAmount += amount;
        
        if (isBefore(dueDate, today)) {
          pastDueIndices.push(index);
          pastDueTotal += amount;
        }

        return {
          dueDate,
          checkNumber: String(row[1] || ''),
          bank: String(row[2] || ''),
          company: String(row[3] || ''),
          businessGroup: String(row[4] || ''),
          description: String(row[5] || ''),
          amount,
          status: 'pending' as const
        };
      })
      .filter(payment => 
        payment.checkNumber && 
        payment.bank && 
        payment.company && 
        payment.businessGroup && 
        payment.amount > 0
      );

    if (payments.length === 0) {
      throw new Error('Geçerli ödeme verisi bulunamadı');
    }

    return {
      payments,
      pastDueIndices,
      pastDueTotal,
      totalAmount
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const processedData = processImportedData(jsonData);
        
        if (processedData.pastDueIndices.length > 0) {
          setImportData({
            payments: processedData.payments,
            pastDuePayments: processedData.pastDueIndices,
            pastDueAmount: processedData.pastDueTotal,
            totalAmount: processedData.totalAmount
          });
          setShowPastDueDialog(true);
        } else {
          const paymentsWithIds = processedData.payments.map(payment => ({
            ...payment,
            id: crypto.randomUUID()
          }));
          onImport(paymentsWithIds);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setImportData({
            payments: processedData.payments,
            pastDuePayments: [],
            pastDueAmount: 0,
            totalAmount: processedData.totalAmount
          });
          setShowSuccessDialog(true);
        }
      } catch (error: any) {
        console.error('Excel okuma hatası:', error);
        alert(error.message || 'Excel dosyası okunurken bir hata oluştu');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePastDueConfirm = () => {
    if (!importData) return;

    const paymentsWithIds = importData.payments.map((payment, index) => ({
      ...payment,
      id: crypto.randomUUID(),
      status: importData.pastDuePayments.includes(index) ? 'paid' : 'pending'
    }));

    onImport(paymentsWithIds);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowPastDueDialog(false);
    setShowSuccessDialog(true);
  };

  const handlePastDueCancel = () => {
    if (!importData) return;
    
    const paymentsWithIds = importData.payments.map(payment => ({
      ...payment,
      id: crypto.randomUUID()
    }));
    
    onImport(paymentsWithIds);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowPastDueDialog(false);
    setShowSuccessDialog(true);
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-[38px]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Excel'den Aktar</span>
      </button>

      <PastDuePaymentsDialog
        isOpen={showPastDueDialog}
        onClose={handlePastDueCancel}
        onConfirm={handlePastDueConfirm}
        pastDueCount={importData?.pastDuePayments.length || 0}
        totalAmount={importData?.pastDueAmount || 0}
      />

      <ImportSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setImportData(null);
        }}
        count={importData?.payments.length || 0}
        totalAmount={importData?.totalAmount || 0}
      />
    </div>
  );
}