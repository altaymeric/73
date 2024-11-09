import React, { useState } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { Payment } from '../types/payment';

interface Category {
  id: string;
  name: string;
  items: string[];
}

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  categories: Category[];
  payments: Payment[];
}

export default function CategoryManagement({ isOpen, onClose, onSave, categories, payments }: CategoryManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('bank');
  const [newItem, setNewItem] = useState('');
  const [editingCategories, setEditingCategories] = useState<Category[]>(categories);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string;
    item: string;
  }>({ isOpen: false, categoryId: '', item: '' });
  const [error, setError] = useState<string>('');

  const isItemInUse = (categoryId: string, item: string): boolean => {
    return payments.some(payment => {
      switch (categoryId) {
        case 'bank':
          return payment.bank === item;
        case 'company':
          return payment.company === item;
        case 'businessGroup':
          return payment.businessGroup === item;
        default:
          return false;
      }
    });
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    setEditingCategories(prev => prev.map(cat => {
      if (cat.id === selectedCategory) {
        return {
          ...cat,
          items: [...cat.items, newItem.trim()]
        };
      }
      return cat;
    }));
    setNewItem('');
    setError('');
  };

  const handleRemoveItem = (categoryId: string, item: string) => {
    if (isItemInUse(categoryId, item)) {
      setError(`"${item}" kayıtlarda kullanıldığı için silinemez.`);
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      categoryId,
      item
    });
    setError('');
  };

  const confirmDelete = () => {
    setEditingCategories(prev => prev.map(cat => {
      if (cat.id === deleteConfirmation.categoryId) {
        return {
          ...cat,
          items: cat.items.filter(i => i !== deleteConfirmation.item)
        };
      }
      return cat;
    }));
    setDeleteConfirmation({ isOpen: false, categoryId: '', item: '' });
  };

  const handleSave = () => {
    editingCategories.forEach(category => onSave(category));
    onClose();
  };

  if (!isOpen) return null;

  const selectedCategoryName = editingCategories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-2xl transform bg-white rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Kategori Yönetimi</h3>
          </div>

          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              {editingCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setError('');
                  }}
                  className={`px-4 py-2 rounded-md ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Yeni ekle..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ekle
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {editingCategories.find(c => c.id === selectedCategory)?.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-md"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveItem(selectedCategory, item)}
                    className={`text-red-600 hover:text-red-700 ${
                      isItemInUse(selectedCategory, item) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isItemInUse(selectedCategory, item)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, categoryId: '', item: '' })}
        onConfirm={confirmDelete}
        title={`${selectedCategoryName} Kategorisinden Sil`}
        message={
          <div>
            <p>Bu öğeyi silmek istediğinizden emin misiniz?</p>
            <p className="mt-2 text-sm text-gray-500">
              Silinecek öğe: <span className="font-medium">{deleteConfirmation.item}</span>
            </p>
          </div>
        }
      />
    </div>
  );
}