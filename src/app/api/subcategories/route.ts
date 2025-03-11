import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import SubCategory from '../../../../models/SubCategory';
import { NextRequest } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { subCategoryName, categoryId, isActive } = await req.json();

        if (!subCategoryName || !categoryId) {
            return NextResponse.json({ message: "Subcategory name and category ID are required" }, { status: 400 });
        }

        const subCategoryExists = await SubCategory.findOne({ subCategoryName, categoryId });
        if (subCategoryExists) {
            return NextResponse.json({ message: "Subcategory already exists in this category" }, { status: 409 });
        }

        const subCategory = await SubCategory.create({ subCategoryName, categoryId, isActive });

        return NextResponse.json({ message: "Subcategory created successfully", subCategory }, { status: 201 });

    } catch (error) {
        console.error("Subcategory creation error:", error);
        return NextResponse.json({ message: "Error creating subcategory", error }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const subCategories = await SubCategory.find({}).populate('categoryId', 'categoryName'); // Populate category name
        return NextResponse.json({ subCategories }, { status: 200 });
    } catch (error) {
        console.error("Subcategory fetch error:", error);
        return NextResponse.json({ message: "Error fetching subcategories", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const { _id, subCategoryName, categoryId, isActive } = await req.json();

        if (!_id || !subCategoryName || !categoryId) {
            return NextResponse.json({ message: "Subcategory ID, name, and category ID are required" }, { status: 400 });
        }

        const subCategory = await SubCategory.findByIdAndUpdate(_id, { subCategoryName, categoryId, isActive }, { new: true }).populate('categoryId', 'categoryName');

        if (!subCategory) {
            return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subcategory updated successfully", subCategory }, { status: 200 });

    } catch (error) {
        console.error("Subcategory update error:", error);
        return NextResponse.json({ message: "Error updating subcategory", error }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const id = req.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Subcategory ID required" }, { status: 400 });
        }

        const subCategory = await SubCategory.findByIdAndDelete(id);

        if (!subCategory) {
            return NextResponse.json({ message: "Subcategory not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subcategory deleted successfully", subCategory }, { status: 200 });

    } catch (error) {
        console.error("Subcategory delete error:", error);
        return NextResponse.json({ message: "Error deleting subcategory", error }, { status: 500 });
    }
}
