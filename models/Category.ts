import mongoose, { Schema, Document } from 'mongoose';

interface ICategory extends Document {
    categoryName: string;
    isActive: boolean;
}

const CategorySchema: Schema = new Schema({
    categoryName: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Category<ICategory> || mongoose.model<ICategory>('Category', CategorySchema);
