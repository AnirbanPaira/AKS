"use client";
import React, { useState } from 'react';
import DashboardContent from './components/DashboardContent';
import ProductContent from './components/ProductContent';
import AddCategoryContent from './components/AddCategoryContent';
import AddSubCategoryContent from './components/AddSubCategoryContent';
import AddProductContent from './components/AddProductContent';

const DashboardPage = () => {
  const [isProductDropdownOpen, setProductDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };


  return (
    <div>
      <nav className="dashboard-nav">
        <div className="tab-bar">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'product' ? 'active' : ''}`}
            onMouseEnter={() => setProductDropdownOpen(true)}
            onMouseLeave={() => setProductDropdownOpen(false)}
          >
            Product
            {isProductDropdownOpen && (
              <div className="dropdown">
                <ul>
             
                  <li onClick={()=>handleTabClick('product')}>Add Category</li>
                  <li onClick={() => handleTabClick('add-sub-category')}>Add Sub Category</li>
                  <li onClick={() => handleTabClick('add-product')}>Add Product</li>
                </ul>
              </div>
            )}
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'product' && <ProductContent />}
        {activeTab === 'add-category' && <AddCategoryContent />}
        {activeTab === 'add-sub-category' && <AddSubCategoryContent />}
        {activeTab === 'add-product' && <AddProductContent />}
      </div>
    </div>
  );
};

export default DashboardPage;
