"use client";
import React, { useState } from 'react';
import DashboardContent from './components/DashboardContent';
import ProductContent from './components/ProductContent';
import AddCategoryContent from './components/AddCategoryContent';
import AddSubCategoryContent from './components/AddSubCategoryContent';
import AddProductContent from './components/AddProductContent';
import styles from '../DashboardPage.module.css'

const DashboardPage = () => {
  const [isProductDropdownOpen, setProductDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.dashboardNav}>
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            Dashboard
          </button>
          
          <div 
            className={styles.dropdownContainer}
            onMouseEnter={() => setProductDropdownOpen(true)}
            onMouseLeave={() => setProductDropdownOpen(false)}
          >
            <button
              className={`${styles.tabButton} ${
                ['product', 'add-category', 'add-sub-category', 'add-product'].includes(activeTab) ? styles.active : ''
              }`}
            >
              Product
              <svg 
                className={styles.dropdownIcon} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
            
            {isProductDropdownOpen && (
              <div className={styles.dropdown}>
                <ul className={styles.dropdownList}>
                  <li 
                    className={`${styles.dropdownItem} ${activeTab === 'product' ? styles.activeItem : ''}`}
                    onClick={() => handleTabClick('product')}
                  >
                    Add Category 
                  </li>
                  <li 
                    className={`${styles.dropdownItem} ${activeTab === 'add-sub-category' ? styles.activeItem : ''}`}
                    onClick={() => handleTabClick('add-sub-category')}
                  >
                    Add Sub Category
                  </li>
                  <li 
                    className={`${styles.dropdownItem} ${activeTab === 'add-product' ? styles.activeItem : ''}`}
                    onClick={() => handleTabClick('add-product')}
                  >
                    Add Product
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.dashboardContent}>
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'product' && <ProductContent />}
        {activeTab === 'add-sub-category' && <AddSubCategoryContent />}
        {activeTab === 'add-product' && <AddProductContent />}
      </div>
    </div>
  );
};

export default DashboardPage;
