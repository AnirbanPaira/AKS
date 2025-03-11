"use client";

import React, { useState } from 'react';

const AddCategoryPage = () => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Category Name:", categoryName);
    // Add API call here later
  };

  return (
    <div>
      <h1>Add New Category</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="categoryName">Category Name:</label>
        <input
          type="text"
          id="categoryName"
          name="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
};

export default AddCategoryPage;
