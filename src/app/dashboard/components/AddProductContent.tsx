import React, { useState, useEffect } from 'react';

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
  fileUrl?: string; // Add this to store existing file URL
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
    status: false // Add status to form state
  });
  const [isActive, setIsActive] = useState(false); //renamed to isActive but actually status
  
  // For tracking if a new image is selected during edit
  const [newImageSelected, setNewImageSelected] = useState(false);

  const resetForm = () => {
    setFormData({
      categoryId: '',
      subCategoryId: '',
      productName: '',
      shortDescription: '',
      features: '',
      status: false // Include status in resetForm
    });
    setIsActive(false); // Reset isActive state
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
      status: productToEdit.status || false // Populate status from productToEdit
    });
    setIsActive(productToEdit.status || false); // Set isActive state for checkbox
    
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
        fileUrl: pdf.fileUrl // Assuming the fileUrl field contains the URL
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
    <div>
      <h2>{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
      {editingProductId && (
        <button 
          onClick={resetForm}
          style={{ background: '#607D8B', color: 'white', padding: '8px 15px', marginBottom: '15px', border: 'none', cursor: 'pointer' }}
        >
          Cancel Editing
        </button>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category">Category</label>
          <select 
            id="category" 
            name="category" 
            required
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
        <div>
          <label htmlFor="subCategory">Sub Category</label>
          <select 
            id="subCategory" 
            name="subCategory" 
            required
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
        <div>
          <label htmlFor="productName">Product Name</label>
          <input 
            type="text" 
            id="productName" 
            name="productName" 
            required 
            value={formData.productName}
            onChange={(e) => setFormData({...formData, productName: e.target.value})}
          />
        </div>
        <div>
          <label htmlFor="productImage">Product Image</label>
          <input 
            type="file" 
            id="productImage" 
            name="productImage" 
            accept="image/*" 
            required={!editingProductId} 
            onChange={() => setNewImageSelected(true)}
          />
          {editingProductId && !newImageSelected && (
            <p style={{ fontSize: '0.85em', color: '#666' }}>
              Leave empty to keep current image. Upload new image to replace.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="shortDescription">Short Description</label>
          <textarea 
            id="shortDescription" 
            name="shortDescription" 
            required
            value={formData.shortDescription}
            onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
          ></textarea>
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              setFormData({...formData, status: e.target.checked});
            }}
          />
        </div>

        {/* PDF Upload section */}
        <div>
          <h3>Upload PDF</h3>
        </div>
        {descriptions.map((description, index) => (
          <div key={description.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor={`descriptionTitle-${description.id}`}>Title</label>
              <input
                type="text"
                id={`descriptionTitle-${description.id}`}
                name={`descriptionTitle-${description.id}`}
                value={description.title}
                onChange={(e) => {
                  const updatedDescriptions = [...descriptions];
                  updatedDescriptions[index].title = e.target.value;
                  setDescriptions(updatedDescriptions);
                }}
                required
              />
            </div>
            <div>
              <label htmlFor={`descriptionHeading-${description.id}`}>Heading</label>
              <input
                type="text"
                id={`descriptionHeading-${description.id}`}
                name={`descriptionHeading-${description.id}`}
                value={description.heading}
                onChange={(e) => {
                  const updatedDescriptions = [...descriptions];
                  updatedDescriptions[index].heading = e.target.value;
                  setDescriptions(updatedDescriptions);
                }}
                required
              />
            </div>
            <div>
              <label htmlFor={`description-${description.id}`}>Description</label>
              <textarea
                id={`description-${description.id}`}
                name={`description-${description.id}`}
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
                style={{ background: '#ff4d4d', color: 'white', marginTop: '10px', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
              >
                Remove Description
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={handleAddDescription}
          style={{ background: '#4CAF50', color: 'white', marginBottom: '20px', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
        >
          Add More Description
        </button>

        <div>
          <h3>Features</h3>
          <label htmlFor="features">Content</label>
          <textarea 
            id="features" 
            name="features"
            value={formData.features}
            onChange={(e) => setFormData({...formData, features: e.target.value})}
          ></textarea>
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              setFormData({...formData, status: e.target.checked});
            }}
          />
        </div>

        {/* PDF Upload section */}
        <div>
          <h3>Upload PDF</h3>
        </div>
        {pdfs.map((pdf, index) => (
          <div key={pdf.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor={`pdfHeading-${pdf.id}`}>PDF Heading</label>
              <input
                type="text"
                id={`pdfHeading-${pdf.id}`}
                name={`pdfHeading-${pdf.id}`}
                value={pdf.heading}
                onChange={(e) => {
                  const updatedPdfs = [...pdfs];
                  updatedPdfs[index].heading = e.target.value;
                  setPdfs(updatedPdfs);
                }}
                required
              />
            </div>
            <div>
              <label htmlFor={`pdfFile-${pdf.id}`}>Upload PDF File</label>
              <input
                type="file"
                id={`pdfFile-${pdf.id}`}
                name={`pdfFile-${pdf.id}`}
                accept="application/pdf"
                onChange={(e) => {
                  const updatedPdfs = [...pdfs];
                  updatedPdfs[index].file = e.target.files ? e.target.files[0] : null;
                  setPdfs(updatedPdfs);
                }}
                required={!editingProductId || !pdf.fileUrl} // Required unless editing and has existing file
              />
              {editingProductId && pdf.fileUrl && (
                <p style={{ fontSize: '0.85em', color: '#666' }}>
                  Current file: {pdf.fileUrl.split('/').pop()} (Upload new file to replace)
                </p>
              )}
            </div>
            {pdfs.length > 1 && (
              <button 
                type="button" 
                onClick={() => handleRemovePdf(pdf.id || '')}
                style={{ background: '#ff4d4d', color: 'white', marginTop: '10px', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
              >
                Remove PDF Section
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={handleAddPdf}
          style={{ background: '#4CAF50', color: 'white', marginBottom: '20px', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
        >
          Add More PDF Section
        </button>

        <button 
          type="submit"
          style={{ background: '#2196F3', color: 'white', padding: '10px 20px', fontSize: '16px', marginTop: '20px', border: 'none', cursor: 'pointer' }}
        >
          {editingProductId ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      <h2 style={{ marginTop: '40px' }}>Products List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', background: '#f2f2f2' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Sr. No</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Sub Category</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Product Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Short Description</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Descriptions</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <tr key={product._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{index + 1}</td>
                <td style={{ padding: '8px' }}>{getCategoryNameById(product.category)}</td>
                <td style={{ padding: '8px' }}>{getSubCategoryNameById(product.subCategory)}</td>
                <td style={{ padding: '8px' }}>{product.productName}</td>
                <td style={{ padding: '8px' }}>{product.shortDescription}</td>
                <td style={{ padding: '8px' }}>
                  {/* Display descriptions summary with toggle */}
                  <div>
                    <button 
                      onClick={() => toggleDescriptionExpand(product._id)}
                      style={{ background: '#e7e7e7', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      {expandedDescription[product._id] ? 'Hide Details' : 'Show Details'} 
                      ({product.descriptions?.length || 0} sections)
                    </button>
                    
                    {expandedDescription[product._id] && product.descriptions && (
                      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', background: '#f9f9f9' }}>
                        {product.descriptions.map((desc, i) => (
                          <div key={i} style={{ marginBottom: '10px', padding: '5px', borderBottom: i < product.descriptions.length - 1 ? '1px solid #eee' : 'none' }}>
                            <p style={{ fontWeight: 'bold', margin: '2px 0' }}>Title: {desc.title}</p>
                            <p style={{ fontStyle: 'italic', margin: '2px 0' }}>Heading: {desc.heading}</p>
                            <p style={{ margin: '2px 0' }}>Description: {desc.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '8px' }}>{product.status ? 'Active' : 'Inactive'}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button 
                    style={{ marginRight: '5px', background: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    onClick={() => handleEdit(product._id)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ padding: '15px', textAlign: 'center' }}>No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddProductContent;
