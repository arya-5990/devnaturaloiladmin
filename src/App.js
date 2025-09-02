import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Products from './pages/Products';
import ComboProducts from './pages/ComboProducts';
import AddProduct from './pages/AddProduct';
import AddBlog from './pages/AddBlog';
import AddCategory from './pages/AddCategory';
import AddBanner from './pages/AddBanner';
import ManageUsers from './pages/ManageUsers';
import Testimonials from './pages/Testimonials';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<Products />} />
              <Route path="/combo-products" element={<ComboProducts />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/add-blog" element={<AddBlog />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/add-banner" element={<AddBanner />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/testimonials" element={<Testimonials />} />
            </Routes>
          </Layout>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
