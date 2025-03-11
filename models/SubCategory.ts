import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISubCategory extends Document {
    subCategoryName: string;
    categoryId: Types.ObjectId; // Reference to Category model
    isActive: boolean;
}

const SubCategorySchema: Schema = new Schema({
    subCategoryName: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.SubCategory<ISubCategory> || mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);
