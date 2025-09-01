import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaPlus, 
  FaBlog, 
  FaTags, 
  FaImages, 
  FaUsers,
  FaBox,
  FaGift
} from 'react-icons/fa';

const Sidebar = () => {
  const navItems = [
    { path: '/products', label: 'Products', icon: <FaBox /> },
    { path: '/combo-products', label: 'Combo Products', icon: <FaGift /> },
    // { path: '/add-product', label: 'Add Product', icon: <FaPlus /> },
    { path: '/add-blog', label: 'Add Blog', icon: <FaBlog /> },
    //{ path: '/add-category', label: 'Add Category', icon: <FaTags /> },
    { path: '/add-banner', label: 'Add Banner', icon: <FaImages /> },
    //{ path: '/manage-users', label: 'Manage Users', icon: <FaUsers /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
