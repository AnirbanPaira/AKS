"use client";
import React, { useState } from 'react';

const DashboardPage = () => {
  const [isProductDropdownOpen, setProductDropdownOpen] = useState(false);

  return (
    <div>
      <nav className="dashboard-nav">
        <div className="tab-bar">
          <button className="tab-button active">Dashboard</button>
          <button
            className="tab-button"
            onMouseEnter={() => setProductDropdownOpen(true)}
            onMouseLeave={() => setProductDropdownOpen(false)}
          >
            Product
            {isProductDropdownOpen && (
              <div className="dropdown">
                <ul>
                  <li>Add Category</li>
                  <li>Add Sub Category</li>
                  <li>Add Product</li>
                </ul>
              </div>
            )}
          </button>
        </div>
        
      </nav>
    </div>
  );
};
export default DashboardPage;
