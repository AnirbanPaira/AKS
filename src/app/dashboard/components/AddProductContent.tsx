import React, { useState, useEffect } from 'react';

interface Description {
  id: string;
  title: string;
  heading: string;
  desc: string;
}

interface Category {
  _id: string;
  categoryName: string; // Changed from 'name' to match API response
  isActive: boolean;
}

interface SubCategory {
  _id: string;
  subCategoryName: string; // Changed from 'name' to match API response
  categoryId: {
    _id: string;
    categoryName: string;
  };
  isActive: boolean;
}

interface Pdf {
  id: string;
  heading: string;
  file: File | null;
}

const AddProductContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [descriptions, setDescriptions] = useState<Description[]>([{ id: '1', title: '', heading: '', desc: '' }]);
  const [pdfs, setPdfs] = useState<Pdf[]>([{ id: '1', heading: '', file: null }]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append('category', formData.get('category') as string);
    formData.append('subCategory', formData.get('subCategory') as string);
    formData.append('productName', formData.get('productName') as string);
    formData.append('productImage', formData.get('productImage') as File); // Append file
    formData.append('shortDescription', formData.get('shortDescription') as string);
    formData.append('features', formData.get('features') as string);

    descriptions.forEach((desc, index) => {
      formData.append(`descriptions[${index}][title]`, formData.get(`descriptionTitle-${desc.id}`) as string);
      formData.append(`descriptions[${index}][heading]`, formData.get(`descriptionHeading-${desc.id}`) as string);
      formData.append(`descriptions[${index}][desc]`, formData.get(`description-${desc.id}`) as string);
    });

    pdfs.forEach((pdf, index) => {
      formData.append(`pdfs[${index}][heading]`, formData.get(`pdfHeading-${pdf.id}`) as string);
      formData.append(`pdfs[${index}][file]`, formData.get(`pdfFile-${pdf.id}`) as File); // Append file
    });

    // Log FormData contents (for debugging)
    for (const pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData, // Send FormData directly
      });

      if (res.ok) {
        console.log("Product added successfully!");
        // Reset form or redirect user
      } else {
        console.error("Error adding product:", res.statusText);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        console.log("Categories API response:", data);
        
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
        console.log("Subcategories API response:", data);
        
        if (data && Array.isArray(data.subCategories)) {
          // Note: API returns 'subCategories' with capital C
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
    console.log("Categories state after update:", categories);
  }, [categories]);

  useEffect(() => {
    console.log("Subcategories state after update:", subCategories);
  }, [subCategories]);

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

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category">Category</label>
          <select id="category" name="category">
            <option value="">Select Category</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName} {/* Changed from 'name' to 'categoryName' */}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="subCategory">Sub Category</label>
          <select id="subCategory" name="subCategory">
            <option value="">Select Sub Category</option>
            {subCategories && subCategories.length > 0 ? (
              subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.subCategoryName} {/* Changed from 'name' to 'subCategoryName' */}
                </option>
              ))
            ) : (
              <option disabled>No subcategories available</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="productName">Product Name</label>
          <input type="text" id="productName" name="productName" />
        </div>
        <div>
          <label htmlFor="productImage">Product Image</label>
          <input type="file" id="productImage" name="productImage" accept="image/*" />
        </div>
        <div>
          <label htmlFor="shortDescription">Short Description</label>
          <textarea id="shortDescription" name="shortDescription"></textarea>
        </div>
        {/* description */}
        <div>
          <h3>Description having title input heading and description</h3>
        </div>
        {descriptions.map((description, index) => (
          <div key={description.id}>
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
              ></textarea>
            </div>
            {descriptions.length > 1 && (
              <button type="button" onClick={() => handleRemoveDescription(description.id)}>
                Remove Description
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddDescription}>Add More Description</button>

        <div>
          <h2>Features</h2>
          <label htmlFor="features">Content</label>
          <textarea id="features" name="features"></textarea>
        </div>

        {/* PDF Upload section */}
        <div>
          <h3>Upload PDF</h3>
        </div>
        {pdfs.map((pdf, index) => (
          <div key={pdf.id}>
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
              />
            </div>
            {pdfs.length > 1 && (
              <button type="button" onClick={() => handleRemovePdf(pdf.id)}>
                Remove Section
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddPdf}>Add More PDF Section</button>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductContent;