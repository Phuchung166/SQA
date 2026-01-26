import { ICategoryFilter } from '@/interFace/interFace';
import React, { useState } from 'react';

export interface CategoryCheckboxProps {
  categories: ICategoryFilter[];
  onChange?: (updatedCategories: ICategoryFilter[]) => void;
}

const CategoryCheckbox: React.FC<CategoryCheckboxProps> = ({ categories, onChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<ICategoryFilter[]>(categories);

  const handleCategoryChange = (index: number) => {
    const updatedCategories = selectedCategories.map((cat, idx) =>
      idx === index ? { ...cat, isChecked: !cat.isChecked } : cat,
    );
    setSelectedCategories(updatedCategories);
    if (onChange) {
      onChange(updatedCategories);
    }
  };

  return (
    <div className="bd-widget-content">
      {selectedCategories.map((category, index) => (
        <div className="checkbox-option" key={index}>
          <input
            id={`course-check-${category.checkId}`}
            type="checkbox"
            checked={category.isChecked}
            onChange={() => handleCategoryChange(index)}
          />
          <label htmlFor={`course-check-${category.checkId}`}>
            {category.name} <span>({category.count})</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoryCheckbox;
