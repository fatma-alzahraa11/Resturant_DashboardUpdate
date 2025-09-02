# Restaurant Dashboard - Product Management System

A modern, clean, and fully functional Product Management page for restaurant dashboards built with React, TypeScript, and TailwindCSS.

## 🎯 Features

### ✅ Category Management
- **Add Categories**: Input field to create new product categories
- **Display Categories**: Categories shown as organized sections with rounded design
- **Edit Categories**: Inline editing with save/cancel functionality
- **Delete Categories**: Confirmation dialog before deletion
- **Local Storage**: All data stored locally (frontend only)

### ✅ Product Management
- **Add Products**: Comprehensive form with all required fields
- **Edit Products**: Full editing capabilities with form pre-population
- **Product Form Fields**:
  - Product Name (text input)
  - Description (multiline textarea)
  - Price (number input with decimal support)
  - Allergens (text input for ingredients/allergens)
  - Category (dropdown from available categories)
  - Product Image (upload with preview)
  - Availability Toggle (Available/Not Available)
  - New Product Toggle (Mark as "New")

### ✅ Product Display
- **Organized by Category**: Products grouped under their respective categories
- **Card Design**: Modern card layout for each product showing:
  - Product image with hover effects
  - Product name and description
  - Price display
  - Availability status badge
  - "New" badge for new products
  - Allergens preview
  - Edit and allergens info buttons

### ✅ Search & Filter
- **Search Functionality**: Search products by name or description
- **Filter Options**: Filter by availability and "new" status
- **Clear Filters**: Easy filter reset functionality
- **Results Counter**: Shows filtered results count

### ✅ Multilingual Support
- **Full RTL Support**: Complete Arabic (RTL) language support
- **Three Languages**: English, Arabic, and German
- **Dynamic UI**: All labels, form fields, and directions update with language changes
- **react-i18next**: Professional translation handling

### ✅ Modern UI/UX
- **Responsive Design**: Works on all screen sizes
- **TailwindCSS**: Modern styling with custom color palette
- **Color Palette**: 
  - Primary: #9d0208, #03071E, #370617, #6A040F, #9D0208D0
  - Accent: #FFBA08, #FAA307, #F48C06, #E85D04, #DC2F02
- **Rounded Corners**: 2xl border radius throughout
- **Soft Shadows**: Modern shadow effects
- **Hover Effects**: Smooth transitions and animations
- **Icons**: Lucide React icons for consistency

### ✅ Enhanced Features
- **Quick Add Product**: Direct product addition without category selection
- **Demo Data**: Sample categories and products for testing
- **Confirmation Dialogs**: Better UX for destructive actions
- **Image Upload**: Drag-and-drop image upload with preview
- **Statistics Dashboard**: Overview cards showing totals and averages
- **No Image Placeholder**: Graceful handling of missing images

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd restaurant-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. **Access Product Management**: Navigate to `/product-list` in the application
2. **Add Categories**: Click "Add Category" to create product categories
3. **Add Products**: Use "Add Product" button or category-specific "Add Product" buttons
4. **Manage Products**: Edit, view allergens, or delete products as needed
5. **Search & Filter**: Use the search bar and filter buttons to find specific products
6. **Demo Data**: Click "Load Demo Data" to see sample categories and products

## 📁 Project Structure

```
src/
├── components/
│   └── ProductManagement/
│       ├── ProductManagement.tsx    # Main component
│       ├── CategoryForm.tsx         # Category creation modal
│       ├── CategoryList.tsx         # Category display and management
│       ├── ProductForm.tsx          # Product creation/editing modal
│       ├── ProductCard.tsx          # Individual product display
│       ├── ProductList.tsx          # Product grid display
│       ├── IngredientsModal.tsx     # Allergens information modal
│       ├── ConfirmationDialog.tsx   # Delete confirmation dialog
│       └── DemoData.tsx             # Sample data component
├── i18n/
│   ├── index.ts                     # i18n configuration
│   └── locales/
│       ├── en.json                  # English translations
│       ├── ar.json                  # Arabic translations
│       └── de.json                  # German translations
└── pages/
    └── ProductList.tsx              # Page wrapper
```

## 🎨 Design System

### Colors
- **Primary Colors**: Deep reds and dark blues for main UI elements
- **Accent Colors**: Warm oranges and yellows for highlights and CTAs
- **Neutral Colors**: Grays for text and backgrounds

### Typography
- **Font Family**: Inter for Latin, Noto Sans Arabic for Arabic
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing
- **Consistent Spacing**: 4px base unit (0.25rem)
- **Component Spacing**: 6, 8, 12, 16, 24, 32, 48, 64px

### Components
- **Cards**: Rounded corners (2xl), soft shadows, hover effects
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean inputs with focus states
- **Modals**: Centered overlays with backdrop blur

## 🌐 Internationalization

The system supports three languages with full RTL support:

### English (en)
- Default language
- Left-to-right layout

### Arabic (ar)
- Complete RTL support
- Right-to-left layout
- Arabic font family

### German (de)
- German translations
- Left-to-right layout

## 🔧 Technical Details

### Technologies Used
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **react-i18next**: Internationalization
- **Lucide React**: Icon library
- **Vite**: Fast build tool

### State Management
- **React Hooks**: useState for local state management
- **Local Storage**: Data persistence (frontend only)
- **Component Props**: Clean data flow between components

### Performance
- **Lazy Loading**: Components load as needed
- **Optimized Images**: Image preview and optimization
- **Efficient Rendering**: React.memo and optimized re-renders

## 📱 Responsive Design

The system is fully responsive and works on:
- **Desktop**: Full feature set with grid layouts
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Stacked layouts with mobile-optimized forms

## 🔮 Future Enhancements

- **Backend Integration**: Connect to real API endpoints
- **Image Storage**: Cloud image storage integration
- **Bulk Operations**: Multi-select and bulk actions
- **Advanced Filtering**: Price range, category filters
- **Export/Import**: CSV/Excel data import/export
- **Analytics**: Product performance tracking
- **Print Support**: Menu printing functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 