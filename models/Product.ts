import mongoose from 'mongoose';

const descriptionSchema = new mongoose.Schema({
  title: String,
  heading: String,
  desc: String
});

const pdfSchema = new mongoose.Schema({
  heading: String,
  file: String
});

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
  productName: {
    type: String,
    required: true
  },
  productImage: String,
  shortDescription: String,
  features: String,
  descriptions: [descriptionSchema],
  pdfs: [pdfSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if model already exists to prevent overwrite during hot reloads
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;