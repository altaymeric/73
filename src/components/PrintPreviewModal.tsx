import React from 'react';
import { format } from 'date-fns';
import { Payment } from '../types/payment';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  payments: Payment[];
  title: string;
  totalAmount: number;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  onPrint,
  payments,
  title,
  totalAmount
}: PrintPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-7xl transform bg-white shadow-xl rounded-lg">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Kapat</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                Tarih: {format(new Date(), 'dd.MM.yyyy HH:mm')}
              </p>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vade Tarihi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Çek No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İş Grubu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className={payment.status === 'paid' ? 'bg-red-100' : ''}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {format(payment.dueDate, 'dd.MM.yyyy')}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{payment.checkNumber}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{payment.bank}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{payment.company}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{payment.businessGroup}</td>
                      <td className="px-6 py-2 text-sm text-gray-900">{payment.description}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {payment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <span className={`${payment.status === 'paid' ? 'text-red-800' : 'text-yellow-800'}`}>
                          {payment.status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={6} className="px-6 py-3 text-right text-sm text-gray-900">
                      Toplam:
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kapat
              </button>
              <button
                onClick={onPrint}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Yazdır
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}