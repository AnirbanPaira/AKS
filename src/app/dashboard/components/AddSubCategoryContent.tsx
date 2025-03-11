import React, { useState, useEffect } from 'react';

interface Category {
  _id: string;
  categoryName: string;
}

interface SubCategory {
  _id?: string;
  subCategoryName: string;
  isActive: boolean;
  categoryId?: {
    _id: string;
    categoryName: string;
  } | string; // Could be either an object or a string ID
  category?: Category;
}

const AddSubCategoryContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data?.categories);
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
        console.log('data', data);
        
        if (data && Array.isArray(data.subCategories)) {
          setSubCategories(data.subCategories);
        } else {
          console.error('Invalid subcategories data format:', data);
          setSubCategories([]); // Set to empty array as fallback
        }
      } else {
        console.error('Failed to fetch subcategories');
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const method = editingSubCategoryId ? 'PUT' : 'POST';
      const url = '/api/subcategories'; // Same URL for both operations

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: editingSubCategoryId,
          categoryId: selectedCategory,
          subCategoryName: subCategoryName,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // After successful operation, refresh the subcategories to get complete data
      fetchSubCategories();
      
      console.log(editingSubCategoryId ? 'SubCategory updated successfully:' : 'SubCategory created successfully:', data);
    } catch (error) {
      console.error('Error processing subcategory:', error);
    }
    
    // Reset form fields after submission
    setSelectedCategory('');
    setSubCategoryName('');
    setIsActive(false);
    setEditingSubCategoryId(null);
  };

  const handleEdit = (subCategory: SubCategory) => {
    // Get the category ID regardless of its format
    let categoryId = '';
    if (subCategory.categoryId) {
      if (typeof subCategory.categoryId === 'string') {
        categoryId = subCategory.categoryId;
      } else if (typeof subCategory.categoryId === 'object' && subCategory.categoryId._id) {
        categoryId = subCategory.categoryId._id;
      }
    } else if (subCategory.category && subCategory.category._id) {
      categoryId = subCategory.category._id;
    }
    
    setSelectedCategory(categoryId);
    setSubCategoryName(subCategory.subCategoryName);
    setIsActive(subCategory.isActive);
    setEditingSubCategoryId(subCategory._id || null);
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/subcategories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // After successful deletion, refresh the subcategories list
      fetchSubCategories();
      console.log('Subcategory deleted successfully:', id);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  // Helper function to get category name from category ID
  const getCategoryNameById = (categoryId: string | { _id: string; categoryName: string } | undefined) => {
    if (!categoryId) return 'N/A';
    
    // If categoryId is an object with categoryName, use it directly
    if (typeof categoryId === 'object' && categoryId.categoryName) {
      return categoryId.categoryName;
    }
    
    // If categoryId is a string, find the category in categories array
    const categoryIdStr = typeof categoryId === 'string' ? categoryId : categoryId._id;
    const category = categories.find(cat => cat._id === categoryIdStr);
    return category ? category.categoryName : 'N/A';
  };

  return (
    <div>
      <h2>{editingSubCategoryId ? 'Update Sub Category' : 'Add Sub Category'}</h2>
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
                {category.categoryName}
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
        <button type="submit">{editingSubCategoryId ? 'Update Sub Category' : 'Add Sub Category'}</button>
      </form>

      <h3>Sub Categories</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Sr.No</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Sub Category Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Category Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Edit</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {subCategories && subCategories.length > 0 ? (
            subCategories.map((subCategory, index) => (
              <tr key={subCategory._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{index + 1}</td>
                <td style={{ padding: '8px' }}>{subCategory.subCategoryName}</td>
                <td style={{ padding: '8px' }}>
                  {getCategoryNameById(subCategory.categoryId) || 
                   getCategoryNameById(subCategory.category?._id) || 
                   'N/A'}
                </td>
                <td style={{ padding: '8px' }}>{subCategory.isActive ? 'Active' : 'Inactive'}</td>
                <td style={{ padding: '8px' }}><button onClick={() => handleEdit(subCategory)}>Edit</button></td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => handleRemove(subCategory._id || '')}>Remove</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '8px', textAlign: 'center' }}>No sub categories found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddSubCategoryContent;