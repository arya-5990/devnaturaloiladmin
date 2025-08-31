# React Admin Panel

A comprehensive React-based admin panel for managing products, blogs, categories, banners, and users with Firebase Firestore and Cloudinary integration.

## Features

- **Sidebar Navigation**: Clean navigation with 5 main sections
- **Product Management**: Add products with auto-calculated discount percentages
- **Blog Management**: Create and manage blog posts with thumbnails
- **Category Management**: Organize content with categories
- **Banner Management**: Create promotional banners
- **User Management**: View and manage user accounts
- **Image Upload**: Drag-and-drop image uploads to Cloudinary
- **Real-time Validation**: Form validation with success/error notifications
- **Responsive Design**: Modern, clean UI that works on all devices

## Tech Stack

- **Frontend**: React 18, React Router v6
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Cloudinary
- **UI**: Custom CSS with React Icons
- **Notifications**: React Toastify

## Prerequisites

Before running this application, you need:

1. **Firebase Project**: Create a Firebase project and enable Firestore
2. **Cloudinary Account**: Sign up for a Cloudinary account
3. **Node.js**: Version 14 or higher

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd react-admin-panel
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and add your credentials:

```env
# Firebase Configuration (DevNaturalOil Project)
REACT_APP_FIREBASE_API_KEY=AIzaSyDu1bNNTgADxr8KlS45YvfjKa2o4Ed0vRo
REACT_APP_FIREBASE_AUTH_DOMAIN=devnaturaloil.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=devnaturaloil
REACT_APP_FIREBASE_STORAGE_BUCKET=devnaturaloil.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=347875608612
REACT_APP_FIREBASE_APP_ID=1:347875608612:web:36490421c09530557130b1
REACT_APP_FIREBASE_MEASUREMENT_ID=G-1NXLE8T1QE

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=di8mxgexq
REACT_APP_CLOUDINARY_API_KEY=477697518172828
REACT_APP_CLOUDINARY_API_SECRET=uq3YGPfB16T2EcysmgOD8cSkuYA
REACT_APP_CLOUDINARY_UPLOAD_PRESET=topxew62
```

**Important:** The `.env` file is already in `.gitignore` and will not be committed to the repository for security.

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Go to Project Settings > General
5. Scroll down to "Your apps" and add a web app
6. Copy the configuration values to your `.env` file

### 4. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to find your Cloud Name
3. Go to Settings > Upload to find your API Key
4. Create an upload preset:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Create a new preset with "Unsigned" signing mode
   - Copy the preset name to your `.env` file

### 5. Firestore Security Rules

Update your Firestore security rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**Note**: For production, implement proper authentication and authorization rules.

### 6. Run the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

### Navigation

The admin panel has 5 main sections accessible via the sidebar:

1. **Add Product**: Create new products with images, pricing, and inventory
2. **Add Blog**: Create blog posts with thumbnails and content
3. **Add Category**: Organize products and content with categories
4. **Add Banner**: Create promotional banners for your website
5. **Manage Users**: View and manage user accounts

### Adding Products

1. Navigate to "Add Product"
2. Upload a product image (drag & drop or click to select)
3. Fill in product details:
   - Title and description
   - Actual MRP and Offered MRP
   - Rating (1-5)
   - Available quantity
4. Discount percentage is automatically calculated
5. Product ID is auto-incremented
6. Click "Add Product" to save

### Image Upload

- All image uploads use Cloudinary
- Supports drag & drop functionality
- Images are optimized and served via CDN
- Only the secure URL is stored in Firestore

### Form Validation

- Required fields are marked with asterisks (*)
- Real-time validation with error messages
- Success notifications on successful submissions
- Error handling for failed operations

## Project Structure

```
src/
├── components/
│   ├── Layout.js          # Main layout wrapper
│   ├── Sidebar.js         # Navigation sidebar
│   └── ImageUpload.js     # Reusable image upload component
├── config/
│   ├── firebase.js        # Firebase configuration
│   └── cloudinary.js      # Cloudinary configuration
├── pages/
│   ├── AddProduct.js      # Product management
│   ├── AddBlog.js         # Blog management
│   ├── AddCategory.js     # Category management
│   ├── AddBanner.js       # Banner management
│   └── ManageUsers.js     # User management
├── App.js                 # Main app component with routing
├── index.js              # App entry point
└── index.css             # Global styles
```

## Data Structure

### Products Collection
```javascript
{
  productId: number,        // Auto-incremented
  title: string,
  description: string,
  imageUrl: string,         // Cloudinary URL
  actualMRP: number,
  offeredMRP: number,
  discount: number,         // Auto-calculated
  rating: number,
  totalQuantity: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Blogs Collection
```javascript
{
  title: string,
  content: string,
  thumbnailUrl: string,     // Cloudinary URL
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Categories Collection
```javascript
{
  name: string,
  imageUrl: string,         // Cloudinary URL
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Banners Collection
```javascript
{
  text: string,
  imageUrl: string,         // Cloudinary URL
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Users Collection
```javascript
{
  displayName: string,
  email: string,
  photoURL: string,
  phoneNumber: string,
  createdAt: timestamp
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Firestore Rules**: Implement proper security rules for production
3. **Authentication**: Add user authentication for admin access
4. **Input Validation**: Validate all user inputs on both client and server
5. **Image Upload**: Set up proper Cloudinary upload presets with restrictions

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

### Environment Variables in Production

Set environment variables in your hosting platform:
- Vercel: Use the dashboard or `vercel env add`
- Netlify: Use the dashboard or `netlify env:set`
- Firebase: Use Firebase Functions or set in hosting configuration

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: Check your Firebase configuration in `.env`
2. **Image Upload Fails**: Verify Cloudinary credentials and upload preset
3. **CORS Errors**: Ensure Cloudinary upload preset allows your domain
4. **Build Errors**: Check for missing dependencies or syntax errors

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
REACT_APP_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase and Cloudinary documentation
