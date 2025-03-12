import React, { useState, useEffect } from 'react';
import styles from '../../ProductContent.module.css';

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

  return (
    <div className={styles.categoryContainer}>
      <h2 className={styles.pageTitle}>Product Categories</h2>
      
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.categoryForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="categoryName" className={styles.inputLabel}>Category Name:</label>
            <input
              type="text"
              id="categoryName"
              className={styles.input}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label htmlFor="isActive" className={styles.inputLabel}>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className={styles.checkbox}
              />
              Active
            </label>
          </div>
          
          <button type="submit" className={styles.actionButton}>
            {editingCategoryId ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Category Name</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id}>
                <td>{index + 1}</td>
                <td>{category.categoryName}</td>
                <td>
                  <span className={category.isActive ? styles.statusActive : styles.statusInactive}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(category)} 
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleRemove(category._id)} 
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductContent;