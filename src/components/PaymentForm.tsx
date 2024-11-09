import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Payment } from '../types/payment';
import ConfirmationDialog from './ConfirmationDialog';

interface Category {
  id: string;
  name: string;
  items: string[];
}

const paymentSchema = z.object({
  dueDate: z.string().min(1, 'Vade tarihi zorunludur'),
  checkNumber: z.string().min(1, 'Çek numarası zorunludur'),
  bank: z.string().min(1, 'Banka adı zorunludur'),
  company: z.string().min(1, 'Firma adı zorunludur'),
  businessGroup: z.string().min(1, 'İş grubu zorunludur'),
  description: z.string(),
  amount: z.string().min(1, 'Tutar zorunludur')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (payment: Omit<Payment, 'id' | 'status'>) => void;
  initialData?: Payment | null;
  categories: Category[];
}

export default function PaymentForm({ onSubmit, initialData, categories }: PaymentFormProps) {
  const [displayAmount, setDisplayAmount] = useState(
    initialData ? initialData.amount.toLocaleString('tr-TR') : ''
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentToSave, setPaymentToSave] = useState<Omit<Payment, 'id' | 'status'> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData ? {
      dueDate: format(initialData.dueDate, 'yyyy-MM-dd'),
      checkNumber: initialData.checkNumber,
      bank: initialData.bank,
      company: initialData.company,
      businessGroup: initialData.businessGroup,
      description: initialData.description,
      amount: initialData.amount.toString()
    } : undefined
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    const numericAmount = parseFloat(data.amount.replace(/\./g, '').replace(',', '.'));
    const payment = {
      dueDate: new Date(data.dueDate),
      checkNumber: data.checkNumber,
      bank: data.bank,
      company: data.company,
      businessGroup: data.businessGroup,
      description: data.description,
      amount: numericAmount
    };
    setPaymentToSave(payment);
    setShowConfirmation(true);
  };

  const confirmSave = () => {
    if (paymentToSave) {
      onSubmit(paymentToSave);
      reset();
      setDisplayAmount('');
      setShowConfirmation(false);
      setPaymentToSave(null);
    }
  };

  const handleDueDateClick = () => {
    setValue('dueDate', format(new Date(), 'yyyy-MM-dd'));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setDisplayAmount('');
      setValue('amount', '');
      return;
    }

    const numericValue = parseInt(value, 10);
    const formattedValue = numericValue.toLocaleString('tr-TR');
    setDisplayAmount(formattedValue);
    setValue('amount', numericValue.toString());
  };

  const formData = watch();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Ödeme Girişi</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vade Tarihi</label>
            <input
              type="date"
              {...register('dueDate')}
              onClick={handleDueDateClick}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Çek No</label>
            <input
              type="text"
              {...register('checkNumber')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.checkNumber && <p className="text-red-500 text-sm mt-1">{errors.checkNumber.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Banka</label>
          <select
            {...register('bank')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Banka Seçiniz</option>
            {categories.find(c => c.id === 'bank')?.items.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
          {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Firma</label>
          <select
            {...register('company')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Firma Seçiniz</option>
            {categories.find(c => c.id === 'company')?.items.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">İş Grubu</label>
          <select
            {...register('businessGroup')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">İş Grubu Seçiniz</option>
            {categories.find(c => c.id === 'businessGroup')?.items.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.businessGroup && <p className="text-red-500 text-sm mt-1">{errors.businessGroup.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tutar</label>
          <input
            type="text"
            value={displayAmount}
            onChange={handleAmountChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Kaydet
          </button>
        </div>
      </form>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSave}
        title="Ödeme Kaydı Onayı"
        message={
          <div>
            <p>Bu ödeme kaydını kaydetmek istediğinizden emin misiniz?</p>
            {paymentToSave && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Çek No:</span> {formData.checkNumber}</p>
                <p><span className="font-medium">Vade Tarihi:</span> {format(new Date(formData.dueDate), 'dd.MM.yyyy')}</p>
                <p><span className="font-medium">Banka:</span> {formData.bank}</p>
                <p><span className="font-medium">Firma:</span> {formData.company}</p>
                <p><span className="font-medium">İş Grubu:</span> {formData.businessGroup}</p>
                <p><span className="font-medium">Tutar:</span> {displayAmount} TL</p>
                {formData.description && (
                  <p><span className="font-medium">Açıklama:</span> {formData.description}</p>
                )}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}