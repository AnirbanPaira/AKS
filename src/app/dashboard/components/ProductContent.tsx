import React, { useState, useEffect } from 'react';

interface Category {
  _id: string;
  categoryName: string;
  isActive: boolean;
}

const ProductContent = () => {
  const [categoryName, setCategoryName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Could not fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const method = editingCategoryId ? 'PUT' : 'POST';
      const url = editingCategoryId ? '/api/categories' : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          _id: editingCategoryId,
          categoryName, 
          isActive 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (editingCategoryId) {
        setCategories(categories.map(cat => cat._id === editingCategoryId ? data.category : cat));
        setEditingCategoryId(null);
        console.log('Category updated successfully:', data);
      } else {
        setCategories([...categories, data.category]);
        console.log('Category created successfully:', data);
      }
      setCategoryName('');
      setIsActive(false);
    } catch (error) {
      console.error("Error processing category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryName(category.categoryName);
    setIsActive(category.isActive);
    setEditingCategoryId(category._id);
  };


  return (
    <div>
      <h2>Product Categories</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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
        <button type="submit">{editingCategoryId ? 'Update' : 'Submit'}</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Sr.No</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Category Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Edit</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{index + 1}</td>
              <td style={{ padding: '8px' }}>{category.categoryName}</td>
              <td style={{ padding: '8px' }}>{category.isActive ? 'Active' : 'Inactive'}</td>
              <td style={{ padding: '8px' }}><button onClick={() => handleEdit(category)}>Edit</button></td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleRemove(category._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  async function handleRemove(id: string) {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setCategories(categories.filter(category => category._id !== id));
      console.log('Category deleted successfully:', id);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }
};

export default ProductContent;
