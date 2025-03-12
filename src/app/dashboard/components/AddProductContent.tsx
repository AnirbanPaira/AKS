import React, { useState, useEffect } from 'react';
import styles from '../../AddProductContent.module.css'; // Import the CSS (create this file separately)

interface Description {
  id?: string;
  _id?: string;
  title: string;
  heading: string;
  desc: string;
}

interface Category {
  _id: string;
  categoryName: string;
  isActive: boolean;
}

interface SubCategory {
  _id: string;
  subCategoryName: string;
  categoryId: {
    _id: string;
    categoryName: string;
  };
  isActive: boolean;
}

interface Pdf {
  id?: string;
  _id?: string;
  heading: string;
  file?: File | null;
  fileUrl?: string;
}

interface Product {
  _id: string;
  category: string | Category;
  subCategory: string | SubCategory;
  productName: string;
  productImage: string;
  shortDescription: string;
  descriptions: Description[];
  features: string;
  pdfs: Pdf[];
  status: boolean;
}

const AddProductContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [descriptions, setDescriptions] = useState<Description[]>([{ id: '1', title: '', heading: '', desc: '' }]);
  const [pdfs, setPdfs] = useState<Pdf[]>([{ id: '1', heading: '', file: null }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [expandedDescription, setExpandedDescription] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    productName: '',
    shortDescription: '',
    features: '',
    status: false
  });
  const [isActive, setIsActive] = useState(false);
  
  // For tracking if a new image is selected during edit
  const [newImageSelected, setNewImageSelected] = useState(false);

  const resetForm = () => {
    setFormData({
      categoryId: '',
      subCategoryId: '',
      productName: '',
      shortDescription: '',
      features: '',
      status: false
    });
    setIsActive(false);
    setDescriptions([{ id: '1', title: '', heading: '', desc: '' }]);
    setPdfs([{ id: '1', heading: '', file: null }]);
    setEditingProductId(null);
    setNewImageSelected(false);
    
    // Reset any file input fields
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formEl = event.target as HTMLFormElement;
    const formDataObj = new FormData(formEl);
    
    // Handle descriptions
    descriptions.forEach((desc, index) => {
      formDataObj.append(`descriptions[${index}][title]`, desc.title);
      formDataObj.append(`descriptions[${index}][heading]`, desc.heading);
      formDataObj.append(`descriptions[${index}][desc]`, desc.desc);
    });

    // Handle PDFs
    pdfs.forEach((pdf, index) => {
      formDataObj.append(`pdfs[${index}][heading]`, pdf.heading);
      if (pdf.file && pdf.file.size > 0) {
        formDataObj.append(`pdfs[${index}][file]`, pdf.file);
      }
      
      // If we're editing and there's an existing PDF file URL but no new file
      if (editingProductId && pdf._id && !pdf.file && pdf.fileUrl) {
        formDataObj.append(`pdfs[${index}][fileUrl]`, pdf.fileUrl);
      }
    });

    try {
      let url = '/api/products';
      let method = 'POST';
      
      if (editingProductId) {
        url = `/api/products?id=${editingProductId}`;
        method = 'PUT';
      }
      
      const res = await fetch(url, {
        method: method,
        body: formDataObj,
      });

      if (res.ok) {
        console.log(editingProductId ? "Product updated successfully!" : "Product added successfully!");
        resetForm();
        formEl.reset();
        fetchProducts(); // Refresh product list
      } else {
        console.error(editingProductId ? "Error updating product:" : "Error adding product:", res.statusText);
      }
    } catch (error) {
      console.error(editingProductId ? "Error updating product:" : "Error adding product:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error("Invalid categories data format:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const res = await fetch('/api/subcategories');
        const data = await res.json();
        if (data && Array.isArray(data.subCategories)) {
          setSubCategories(data.subCategories);
        } else {
          console.error("Invalid subcategories data format:", data);
          setSubCategories([]);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handler to populate form when editing a product
  const handleEdit = (productId: string) => {
    const productToEdit = products.find(product => product._id === productId);
    
    if (!productToEdit) {
      console.error(`Product with ID ${productId} not found`);
      return;
    }
    
    // Set editing ID
    setEditingProductId(productId);
    
    // Populate form with product data
    setFormData({
      categoryId: typeof productToEdit.category === 'string' ? 
        productToEdit.category : 
        productToEdit.category._id,
      subCategoryId: typeof productToEdit.subCategory === 'string' ? 
        productToEdit.subCategory : 
        productToEdit.subCategory._id,
      productName: productToEdit.productName,
      shortDescription: productToEdit.shortDescription,
      features: productToEdit.features || '',
      status: productToEdit.status || false
    });
    setIsActive(productToEdit.status || false);
    
    // Set descriptions
    if (productToEdit.descriptions && productToEdit.descriptions.length > 0) {
      setDescriptions(productToEdit.descriptions.map((desc, index) => ({
        id: String(index + 1),
        _id: desc._id,
        title: desc.title,
        heading: desc.heading,
        desc: desc.desc
      })));
    } else {
      setDescriptions([{ id: '1', title: '', heading: '', desc: '' }]);
    }
    
    // Set PDFs
    if (productToEdit.pdfs && productToEdit.pdfs.length > 0) {
      setPdfs(productToEdit.pdfs.map((pdf, index) => ({
        id: String(index + 1),
        _id: pdf._id,
        heading: pdf.heading,
        file: null,
        fileUrl: pdf.fileUrl
      })));
    } else {
      setPdfs([{ id: '1', heading: '', file: null }]);
    }
    
    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error("Invalid products data format:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddDescription = () => {
    const newId = String(descriptions.length + 1);
    setDescriptions([...descriptions, { id: newId, title: '', heading: '', desc: '' }]);
  };

  const handleRemoveDescription = (id: string) => {
    setDescriptions(descriptions.filter(description => description.id !== id));
  };

  const handleAddPdf = () => {
    const newId = String(pdfs.length + 1);
    setPdfs([...pdfs, { id: newId, heading: '', file: null }]);
  };

  const handleRemovePdf = (id: string) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== id));
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts(); // Refresh product list
        console.log(`Product with ID ${id} removed successfully`);
      } else {
        console.error(`Error removing product with ID ${id}: ${res.statusText}`);
      }
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  const toggleDescriptionExpand = (productId: string) => {
    setExpandedDescription(prevState => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  const getCategoryNameById = (categoryId: string | { _id: string; categoryName: string } | undefined) => {
    if (!categoryId) return 'N/A';

    if (typeof categoryId === 'object' && categoryId.categoryName) {
      return categoryId.categoryName;
    }

    const categoryIdStr = typeof categoryId === 'string' ? categoryId : categoryId._id;
    const category = categories.find(cat => cat._id === categoryIdStr);
    return category ? category.categoryName : 'N/A';
  };

  const getSubCategoryNameById = (subCategoryId: string | { _id: string; subCategoryName: string } | undefined) => {
    if (!subCategoryId) return 'N/A';

    if (typeof subCategoryId === 'object' && subCategoryId.subCategoryName) {
      return subCategoryId.subCategoryName;
    }

    const subCategoryIdStr = typeof subCategoryId === 'string' ? subCategoryId : subCategoryId._id;
    const subCategory = subCategories.find(subCat => subCat._id === subCategoryIdStr);
    return subCategory ? subCategory.subCategoryName : 'N/A';
  };

  return (
    <div className={styles.productContainer}>
      <h2 className={styles.pageTitle}>{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
      
      {editingProductId && (
        <button 
          onClick={resetForm}
          className={styles.cancelButton}
        >
          Cancel Editing
        </button>
      )}
      
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="category">Category</label>
              <select 
                id="category" 
                name="category" 
                required
                className={styles.select}
                value={formData.categoryId} 
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="subCategory">Sub Category</label>
              <select 
                id="subCategory" 
                name="subCategory" 
                required
                className={styles.select}
                value={formData.subCategoryId}
                onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}
              >
                <option value="">Select Sub Category</option>
                {subCategories && subCategories.length > 0 ? (
                  subCategories.map((subCategory) => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.subCategoryName}
                    </option>
                  ))
                ) : (
                  <option disabled>No subcategories available</option>
                )}
              </select>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="productName">Product Name</label>
              <input 
                type="text" 
                id="productName" 
                name="productName" 
                required 
                className={styles.input}
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="productImage">Product Image</label>
              <input 
                type="file" 
                id="productImage" 
                name="productImage" 
                accept="image/*" 
                required={!editingProductId} 
                className={styles.fileInput}
                onChange={() => setNewImageSelected(true)}
              />
              {editingProductId && !newImageSelected && (
                <p className={styles.helperText}>
                  Leave empty to keep current image. Upload new image to replace.
                </p>
              )}
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="shortDescription">Short Description</label>
            <textarea 
              id="shortDescription" 
              name="shortDescription" 
              required
              className={styles.textarea}
              value={formData.shortDescription}
              onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
            ></textarea>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="statusToggle"
              name="status"
              className={styles.checkbox}
              checked={isActive}
              onChange={(e) => {
                setIsActive(e.target.checked);
                setFormData({...formData, status: e.target.checked});
              }}
            />
            <label className={styles.checkboxLabel} htmlFor="statusToggle">Active</label>
          </div>

          <h3 className={styles.sectionTitle}>Descriptions</h3>
          
          {descriptions.map((description, index) => (
            <div key={description.id} className={styles.contentSection}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor={`descriptionTitle-${description.id}`}>Title</label>
                <input
                  type="text"
                  id={`descriptionTitle-${description.id}`}
                  name={`descriptionTitle-${description.id}`}
                  className={styles.input}
                  value={description.title}
                  onChange={(e) => {
                    const updatedDescriptions = [...descriptions];
                    updatedDescriptions[index].title = e.target.value;
                    setDescriptions(updatedDescriptions);
                  }}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor={`descriptionHeading-${description.id}`}>Heading</label>
                <input
                  type="text"
                  id={`descriptionHeading-${description.id}`}
                  name={`descriptionHeading-${description.id}`}
                  className={styles.input}
                  value={description.heading}
                  onChange={(e) => {
                    const updatedDescriptions = [...descriptions];
                    updatedDescriptions[index].heading = e.target.value;
                    setDescriptions(updatedDescriptions);
                  }}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor={`description-${description.id}`}>Description</label>
                <textarea
                  id={`description-${description.id}`}
                  name={`description-${description.id}`}
                  className={styles.textarea}
                  value={description.desc}
                  onChange={(e) => {
                    const updatedDescriptions = [...descriptions];
                    updatedDescriptions[index].desc = e.target.value;
                    setDescriptions(updatedDescriptions);
                  }}
                  required
                ></textarea>
              </div>
              
              {descriptions.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveDescription(description.id || '')}
                  className={styles.removeButton}
                >
                  Remove Description
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={handleAddDescription}
            className={styles.addButton}
          >
            Add More Description
          </button>

          <h3 className={styles.sectionTitle}>Features</h3>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="features">Content</label>
            <textarea 
              id="features" 
              name="features"
              className={styles.textarea}
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
            ></textarea>
          </div>

          <h3 className={styles.sectionTitle}>Upload PDF</h3>
          
          {pdfs.map((pdf, index) => (
            <div key={pdf.id} className={styles.contentSection}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor={`pdfHeading-${pdf.id}`}>PDF Heading</label>
                <input
                  type="text"
                  id={`pdfHeading-${pdf.id}`}
                  name={`pdfHeading-${pdf.id}`}
                  className={styles.input}
                  value={pdf.heading}
                  onChange={(e) => {
                    const updatedPdfs = [...pdfs];
                    updatedPdfs[index].heading = e.target.value;
                    setPdfs(updatedPdfs);
                  }}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor={`pdfFile-${pdf.id}`}>Upload PDF File</label>
                <input
                  type="file"
                  id={`pdfFile-${pdf.id}`}
                  name={`pdfFile-${pdf.id}`}
                  accept="application/pdf"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const updatedPdfs = [...pdfs];
                    updatedPdfs[index].file = e.target.files ? e.target.files[0] : null;
                    setPdfs(updatedPdfs);
                  }}
                  required={!editingProductId || !pdf.fileUrl}
                />
                {editingProductId && pdf.fileUrl && (
                  <p className={styles.helperText}>
                    Current file: {pdf.fileUrl.split('/').pop()} (Upload new file to replace)
                  </p>
                )}
              </div>
              
              {pdfs.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemovePdf(pdf.id || '')}
                  className={styles.removeButton}
                >
                  Remove PDF Section
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={handleAddPdf}
            className={styles.addButton}
          >
            Add More PDF Section
          </button>

          <button 
            type="submit"
            className={styles.actionButton}
          >
            {editingProductId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>

      <h2 className={styles.sectionTitle}>Products List</h2>
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Product Name</th>
              <th>Short Description</th>
              <th>Descriptions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>{getCategoryNameById(product.category)}</td>
                  <td>{getSubCategoryNameById(product.subCategory)}</td>
                  <td>{product.productName}</td>
                  <td>{product.shortDescription}</td>
                  <td>
                    <button 
                      onClick={() => toggleDescriptionExpand(product._id)}
                      className={styles.detailsButton}
                    >
                      {expandedDescription[product._id] ? 'Hide Details' : 'Show Details'} 
                      ({product.descriptions?.length || 0} sections)
                    </button>
                    
                    {expandedDescription[product._id] && product.descriptions && (
                      <div className={styles.expandedDetails}>
                        {product.descriptions.map((desc, i) => (
                          <div key={i} className={styles.detailItem}>
                            <p className={styles.detailTitle}>Title: {desc.title}</p>
                            <p className={styles.detailHeading}>Heading: {desc.heading}</p>
                            <p className={styles.detailText}>Description: {desc.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {product.status || (product.isActive) ? (
                      <span className={styles.statusActive}>Active</span>
                    ) : (
                      <span className={styles.statusInactive}>Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEdit(product._id)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemove(product._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyState}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddProductContent;
