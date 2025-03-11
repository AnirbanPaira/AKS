import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Category from '../../../../models/Category';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { categoryName, isActive } = await req.json();

        if (!categoryName) {
            return NextResponse.json({ message: "Category name is required" }, { status: 400 });
        }

        const categoryExists = await Category.findOne({ categoryName });
        if (categoryExists) {
            return NextResponse.json({ message: "Category already exists" }, { status: 409 });
        }

        const category = await Category.create({ categoryName, isActive });

        return NextResponse.json({ message: "Category created successfully", category }, { status: 201 });

    } catch (error) {
        console.error("Category creation error:", error);
        return NextResponse.json({ message: "Error creating category", error }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({});
        return NextResponse.json({ categories }, { status: 200 });
    } catch (error) {
        console.error("Category fetch error:", error);
        return NextResponse.json({ message: "Error fetching categories", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const { _id, categoryName, isActive } = await req.json();

        if (!_id || !categoryName) {
            return NextResponse.json({ message: "Category ID and name are required" }, { status: 400 });
        }

        const category = await Category.findByIdAndUpdate(_id, { categoryName, isActive }, { new: true });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Category updated successfully", category }, { status: 200 });

    } catch (error) {
        console.error("Category update error:", error);
        return NextResponse.json({ message: "Error updating category", error }, { status: 500 });
    }
}

// import { NextRequest, NextResponse } from 'next/server'; // Removed duplicate import
import { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const id = request.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Category ID required" }, { status: 400 });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Category deleted successfully", category }, { status: 200 });

    } catch (error) {
        console.error("Category delete error:", error);
        return NextResponse.json({ message: "Error deleting category", error }, { status: 500 });
    }
}
