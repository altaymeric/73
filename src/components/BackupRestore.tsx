import React, { useState } from 'react';
import { Payment } from '../types/payment';

interface BackupRestoreProps {
  payments: Payment[];
  onRestore: (payments: Payment[]) => void;
}

export default function BackupRestore({ payments, onRestore }: BackupRestoreProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleBackup = () => {
    try {
      const data = JSON.stringify(payments, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `odeme_takip_yedek_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      alert('Yedekleme sırasında bir hata oluştu.');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const restoredData = JSON.parse(content);
        
        if (!Array.isArray(restoredData)) {
          throw new Error('Geçersiz yedek dosyası formatı');
        }

        const isValidData = restoredData.every((item: any) => 
          item.id && 
          item.dueDate && 
          item.checkNumber && 
          item.bank && 
          item.company && 
          item.businessGroup && 
          typeof item.amount === 'number' &&
          (item.status === 'paid' || item.status === 'pending')
        );

        if (!isValidData) {
          throw new Error('Yedek dosyası eksik veya hatalı veri içeriyor');
        }

        const processedData = restoredData.map((item: any) => ({
          ...item,
          dueDate: new Date(item.dueDate)
        }));

        onRestore(processedData);
        setShowMenu(false);
        alert('Veriler başarıyla geri yüklendi!');
      } catch (error) {
        alert('Geri yükleme sırasında bir hata oluştu. Lütfen geçerli bir yedek dosyası seçin.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 h-[38px]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
        </svg>
        <span>Yedekleme</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-purple-600 ring-1 ring-purple-700 z-50">
          <div className="py-1">
            <button
              onClick={handleBackup}
              className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-purple-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Yedekle</span>
            </button>
            <label className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-purple-700 cursor-pointer transition-colors duration-150">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Geri Yükle</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {showMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
}