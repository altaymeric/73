import React, { useState, useEffect, useRef } from 'react';
import { format, parse, isSameMonth, isSameYear } from 'date-fns';
import { Payment } from '../types/payment';
import ContextMenu from './ContextMenu';
import ConfirmationDialog from './ConfirmationDialog';

interface Position {
  x: number;
  y: number;
}

interface PaymentListProps {
  payments: Payment[];
  onEdit?: (payment: Payment) => void;
  onStatusChange?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

export default function PaymentList({ payments, onEdit, onStatusChange, onDelete }: PaymentListProps) {
  const [contextMenu, setContextMenu] = useState<{ position: Position; payment: Payment } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [paymentToUpdateStatus, setPaymentToUpdateStatus] = useState<Payment | null>(null);
  const [showBusinessGroupFilter, setShowBusinessGroupFilter] = useState(false);
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);
  const [showBankFilter, setShowBankFilter] = useState(false);
  const [selectedBusinessGroups, setSelectedBusinessGroups] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const businessGroupFilterRef = useRef<HTMLDivElement>(null);
  const companyFilterRef = useRef<HTMLDivElement>(null);
  const bankFilterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    month: '',
    checkNumber: '',
    description: '',
    amount: '',
    status: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (businessGroupFilterRef.current && !businessGroupFilterRef.current.contains(event.target as Node)) {
        setShowBusinessGroupFilter(false);
      }
      if (companyFilterRef.current && !companyFilterRef.current.contains(event.target as Node)) {
        setShowCompanyFilter(false);
      }
      if (bankFilterRef.current && !bankFilterRef.current.contains(event.target as Node)) {
        setShowBankFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setFilters({
      month: '',
      checkNumber: '',
      description: '',
      amount: '',
      status: ''
    });
    setSelectedBusinessGroups([]);
    setSelectedCompanies([]);
    setSelectedBanks([]);
  }, [payments.length]);

  const handleContextMenu = (e: React.MouseEvent, payment: Payment, field: string) => {
    if (field === 'status') {
      e.preventDefault();
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        payment
      });
    }
  };

  const handleEdit = () => {
    if (contextMenu && onEdit) {
      onEdit(contextMenu.payment);
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      setPaymentToDelete(contextMenu.payment);
      setShowDeleteConfirmation(true);
      setContextMenu(null);
    }
  };

  const confirmDelete = () => {
    if (paymentToDelete && onDelete) {
      onDelete(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  const handleStatusClick = (payment: Payment) => {
    if (payment.status === 'paid') {
      setPaymentToUpdateStatus(payment);
      setShowStatusConfirmation(true);
    } else {
      if (onStatusChange) {
        onStatusChange({
          ...payment,
          status: 'paid'
        });
      }
    }
  };

  const confirmStatusChange = () => {
    if (paymentToUpdateStatus && onStatusChange) {
      onStatusChange({
        ...paymentToUpdateStatus,
        status: 'pending'
      });
      setPaymentToUpdateStatus(null);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleBusinessGroup = (group: string) => {
    setSelectedBusinessGroups(prev => {
      if (prev.includes(group)) {
        return prev.filter(g => g !== group);
      } else {
        return [...prev, group];
      }
    });
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(company)) {
        return prev.filter(c => c !== company);
      } else {
        return [...prev, company];
      }
    });
  };

  const toggleBank = (bank: string) => {
    setSelectedBanks(prev => {
      if (prev.includes(bank)) {
        return prev.filter(b => b !== bank);
      } else {
        return [...prev, bank];
      }
    });
  };

  const selectAllBusinessGroups = () => {
    setSelectedBusinessGroups(uniqueBusinessGroups);
  };

  const selectAllCompanies = () => {
    setSelectedCompanies(uniqueCompanies);
  };

  const selectAllBanks = () => {
    setSelectedBanks(uniqueBanks);
  };

  const clearBusinessGroups = () => {
    setSelectedBusinessGroups([]);
  };

  const clearCompanies = () => {
    setSelectedCompanies([]);
  };

  const clearBanks = () => {
    setSelectedBanks([]);
  };

  const uniqueBusinessGroups = Array.from(new Set(payments.map(p => p.businessGroup))).sort();
  const uniqueCompanies = Array.from(new Set(payments.map(p => p.company))).sort();
  const uniqueBanks = Array.from(new Set(payments.map(p => p.bank))).sort();

  const filteredPayments = payments.filter(payment => {
    const monthFilter = filters.month 
      ? parse(filters.month, 'yyyy-MM', new Date())
      : null;

    return (
      (!monthFilter || (isSameMonth(payment.dueDate, monthFilter) && isSameYear(payment.dueDate, monthFilter))) &&
      (!filters.checkNumber || payment.checkNumber.toLowerCase().includes(filters.checkNumber.toLowerCase())) &&
      (selectedBanks.length === 0 || selectedBanks.includes(payment.bank)) &&
      (selectedCompanies.length === 0 || selectedCompanies.includes(payment.company)) &&
      (selectedBusinessGroups.length === 0 || selectedBusinessGroups.includes(payment.businessGroup)) &&
      (!filters.description || payment.description.toLowerCase().includes(filters.description.toLowerCase())) &&
      (!filters.amount || payment.amount.toString().includes(filters.amount)) &&
      (!filters.status || payment.status === filters.status)
    );
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const renderCell = (payment: Payment, field: string) => {
    switch (field) {
      case 'dueDate':
        return format(payment.dueDate, 'dd.MM.yyyy');
      case 'amount':
        return payment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
      case 'status':
        return (
          <button
            onClick={() => handleStatusClick(payment)}
            onContextMenu={(e) => handleContextMenu(e, payment, field)}
            className={`text-xs font-medium ${
              payment.status === 'paid'
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}
          >
            {payment.status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
          </button>
        );
      default:
        return String(payment[field as keyof Payment]);
    }
  };

  const renderFilterDropdown = (
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    onSelectAll: () => void,
    onClear: () => void
  ) => (
    <div
      ref={ref}
      className="absolute mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="p-2 border-b flex justify-between">
        <button
          onClick={onSelectAll}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Tümünü Seç
        </button>
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Temizle
        </button>
      </div>
      <div className="py-1 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => onToggle(item)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-8 gap-4 flex-1">
            <div>
              <input
                type="month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md"
                placeholder="Ay Seçin"
              />
            </div>
            <div>
              <input
                type="text"
                value={filters.checkNumber}
                onChange={(e) => handleFilterChange('checkNumber', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md"
                placeholder="Çek No"
              />
            </div>
            <div>
              <input
                type="text"
                value={selectedBanks.join(', ')}
                readOnly
                onClick={() => setShowBankFilter(true)}
                className="w-full px-2 py-1 text-sm border rounded-md cursor-pointer bg-white"
                placeholder="Banka"
              />
            </div>
            <div>
              <input
                type="text"
                value={selectedCompanies.join(', ')}
                readOnly
                onClick={() => setShowCompanyFilter(true)}
                className="w-full px-2 py-1 text-sm border rounded-md cursor-pointer bg-white"
                placeholder="Firma"
              />
            </div>
            <div>
              <input
                type="text"
                value={selectedBusinessGroups.join(', ')}
                readOnly
                onClick={() => setShowBusinessGroupFilter(true)}
                className="w-full px-2 py-1 text-sm border rounded-md cursor-pointer bg-white"
                placeholder="İş Grubu"
              />
            </div>
            <div>
              <input
                type="text"
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md"
                placeholder="Açıklama"
              />
            </div>
            <div>
              <input
                type="text"
                value={filters.amount}
                onChange={(e) => handleFilterChange('amount', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md"
                placeholder="Tutar"
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md"
              >
                <option value="">Tümü</option>
                <option value="pending">Ödenmedi</option>
                <option value="paid">Ödendi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vade Tarihi</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çek No</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <button
                    onClick={() => setShowBankFilter(!showBankFilter)}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Banka</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showBankFilter && renderFilterDropdown(
                    bankFilterRef,
                    uniqueBanks,
                    selectedBanks,
                    toggleBank,
                    selectAllBanks,
                    clearBanks
                  )}
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <button
                    onClick={() => setShowCompanyFilter(!showCompanyFilter)}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Firma</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCompanyFilter && renderFilterDropdown(
                    companyFilterRef,
                    uniqueCompanies,
                    selectedCompanies,
                    toggleCompany,
                    selectAllCompanies,
                    clearCompanies
                  )}
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <button
                    onClick={() => setShowBusinessGroupFilter(!showBusinessGroupFilter)}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>İş Grubu</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showBusinessGroupFilter && renderFilterDropdown(
                    businessGroupFilterRef,
                    uniqueBusinessGroups,
                    selectedBusinessGroups,
                    toggleBusinessGroup,
                    selectAllBusinessGroups,
                    clearBusinessGroups
                  )}
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr 
                  key={payment.id} 
                  className={`hover:bg-gray-50 ${payment.status === 'paid' ? 'bg-red-200' : ''}`}
                >
                  {['dueDate', 'checkNumber', 'bank', 'company', 'businessGroup', 'description', 'amount', 'status'].map((field) => (
                    <td
                      key={field}
                      className="px-6 py-1.5 whitespace-nowrap text-sm text-gray-900"
                    >
                      {renderCell(payment, field)}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-1.5 text-center text-sm text-gray-500">
                    Henüz ödeme kaydı bulunmamaktadır
                  </td>
                </tr>
              ) : (
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={6} className="px-6 py-2 text-right text-sm text-gray-900">
                    Toplam:
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContextMenu
        position={contextMenu?.position ?? null}
        onClose={() => setContextMenu(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setPaymentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Ödeme Kaydını Sil"
        message={
          <div>
            <p>Bu ödeme kaydını silmek istediğinizden emin misiniz?</p>
            {paymentToDelete && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Çek No: {paymentToDelete.checkNumber}</p>
                <p>Tutar: {paymentToDelete.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
              </div>
            )}
          </div>
        }
      />

      <ConfirmationDialog
        isOpen={showStatusConfirmation}
        onClose={() => {
          setShowStatusConfirmation(false);
          setPaymentToUpdateStatus(null);
        }}
        onConfirm={confirmStatusChange}
        title="Ödeme Durumunu Değiştir"
        message={
          <div>
            <p>Bu çek ödenmiştir. Yine de değiştirmek istiyor musunuz?</p>
            {paymentToUpdateStatus && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Çek No: {paymentToUpdateStatus.checkNumber}</p>
                <p>Tutar: {paymentToUpdateStatus.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
              </div>
            )}
          </div>
        }
      />
    </>
  );
}