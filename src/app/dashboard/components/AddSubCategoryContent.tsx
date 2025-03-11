import React, { useState, useEffect } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id?: string;
  name: string;
  isActive: boolean;
  categoryName?: string;
  category?: Category;
}

const AddSubCategoryContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const response = await fetch('/api/subcategories');
        if (response.ok) {
          const data = await response.json();
          setSubCategories(data.subcategories);
        } else {
          console.error('Failed to fetch subcategories');
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: subCategoryName,
          isActive,
        }),
      });

      if (response.ok) {
        console.log('Subcategory added successfully');
        const data = await response.json();
        setSubCategories(data.subcategories);
      } else {
        console.error('Failed to add subcategory');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
    }
    // Reset form fields after submission
    setSelectedCategory('');
    setSubCategoryName('');
    setIsActive(false);
  };

  return (
    <div>
      <h2>Add Sub Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subCategoryName">Sub Category Name:</label>
          <input
            type="text"
            id="subCategoryName"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="isActive">Active:</label>
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </div>
        <button type="submit">Add Sub Category</button>
      </form>

      <h3>Sub Categories</h3>
      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Category Name</th>
            <th>Sub Category Name</th>
            <th>Status</th>
            <th>Edit</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {subCategories.map((subCategory, index) => (
            <tr key={subCategory._id}>
              <td>{index + 1}</td>
              <td>{subCategory.categoryName}</td>
              <td>{subCategory.name}</td>
              <td>{subCategory.isActive ? 'Active' : 'Inactive'}</td>
              <td><button>Edit</button></td>
              <td><button>Remove</button></td>
            </tr>
          ))}
          {subCategories.length === 0 && (
            <tr>
              <td colSpan={6}>No subcategories added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddSubCategoryContent;
