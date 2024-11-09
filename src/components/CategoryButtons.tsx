import React from 'react';

interface CategoryButtonsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryButtons({ selectedCategory, onCategoryChange }: CategoryButtonsProps) {
  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'bank', label: 'Banka' },
    { id: 'company', label: 'Firma' },
    { id: 'businessGroup', label: 'İş Grubu' },
  ];

  return (
    <div className="flex space-x-4 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}