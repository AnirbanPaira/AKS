import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Handle FormData instead of JSON
    const formData = await req.formData();
    
    // Extract basic fields
    interface ProductData {
      category: string | null;
      subCategory:  mongoose.Schema.Types.ObjectId[];
      productName: string | null;
      shortDescription: string | null;
      features: string | null;
      isActive: boolean;
      descriptions: { title: string | null; heading: string | null; desc: string | null }[];
      pdfs: { heading: string | null; file: string | null }[];
      productImage?: string;
    }

    const productData: ProductData = {
      category: formData.get('category')?.toString() || null,
      subCategory: [], // Initialize empty array for ObjectIds
      productName: formData.get('productName')?.toString() || null,
      shortDescription: formData.get('shortDescription')?.toString() || null,
      features: formData.get('features')?.toString() || null,
      isActive: formData.get('status') === 'true' || formData.get('status') === 'on', // Handle checkbox value
      descriptions: [],
      pdfs: []
    };

    // Process subCategories (multiple selection)
    productData.subCategory = []; // Initialize as empty array
    
    // Iterate through all form keys to find subcategory entries
    for (const key of formData.keys()) {
      if (key.startsWith('subCategories')) {
        const value = formData.get(key)?.toString();
        if (value) {
          // Convert string ID to ObjectId using explicit type casting
          productData.subCategory.push(value as unknown as mongoose.Schema.Types.ObjectId);
        }
      }
    }

    // Handle product image upload
    const productImage = formData.get('productImage') as File;
    if (productImage && productImage.size > 0) {
      const uploadDir = join(process.cwd(), 'public/uploads/products');
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        console.log("Directory already exists or cannot be created");
      }
      
      // Generate unique filename
      const fileName = `${Date.now()}-${productImage.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, fileName);
      
      // Write file to disk
      const imageBuffer = await productImage.arrayBuffer();
      await writeFile(filePath, Buffer.from(imageBuffer));
      
      // Store relative path in database
      productData.productImage = `/uploads/products/${fileName}`;
    }

    // Process descriptions
    let index = 0;
    while (formData.has(`descriptions[${index}][title]`) || 
           formData.has(`descriptions[${index}][heading]`) || 
           formData.has(`descriptions[${index}][desc]`)) {
      
      productData.descriptions.push({
        title: formData.get(`descriptions[${index}][title]`)?.toString() || null,
        heading: formData.get(`descriptions[${index}][heading]`)?.toString() || null,
        desc: formData.get(`descriptions[${index}][desc]`)?.toString() || null
      });
      
      index++;
    }

    // Process PDF uploads
    index = 0;
    while (formData.has(`pdfs[${index}][heading]`)) {
      const pdfFile = formData.get(`pdfs[${index}][file]`) as File;
      let pdfPath = null;
      
      if (pdfFile && pdfFile.size > 0) {
        const uploadDir = join(process.cwd(), 'public/uploads/pdfs');
        
        // Ensure upload directory exists
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch {
          console.log("Directory already exists or cannot be created");
        }
        
        // Generate unique filename
        const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, fileName);
        
        // Write file to disk
        const pdfBuffer = await pdfFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(pdfBuffer));
        
        // Store relative path in database
        pdfPath = `/uploads/pdfs/${fileName}`;
      }
      
      productData.pdfs.push({
        heading: formData.get(`pdfs[${index}][heading]`)?.toString() || null,
        file: pdfPath
      });
      
      index++;
    }

    console.log("Product data to be saved:", productData);
    
    // Create product in database with the properly formatted data
    const product = await Product.create(productData);
    
    return NextResponse.json({ message: "Product Created", product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.log("Error name:", error.name);
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
    }
    return NextResponse.json({ message: "Error creating product", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Also update the PUT method to handle the same conversion
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const id = new URL(req.url).searchParams.get("id");
    
    // Handle FormData for updates
    const formData = await req.formData();
    
    interface ProductUpdateData {
      category?: string;
      subCategory?: string[]; // Store as string IDs
      productName?: string;
      shortDescription?: string;
      features?: string;
      isActive?: boolean;
      descriptions?: { title: string | null; heading: string | null; desc: string | null }[] | null;
      pdfs?: { heading: string | null; file?: string | null }[] | null;
      productImage?: string;
    }

    const productData: ProductUpdateData = {};
    
    // Explicitly handle isActive/status
    const statusValue = formData.get('status');
    productData.isActive = statusValue === 'true' || statusValue === 'on';

    // Process basic fields excluding isActive
    const categoryValue = formData.get('category');
    if (categoryValue !== null) {
      productData.category = categoryValue?.toString();
    }

    // Process subCategories (multiple selection)
    const subCategoryKeys = Array.from(formData.keys()).filter(key => key.startsWith('subCategories['));
    
    if (subCategoryKeys.length > 0) {
      productData.subCategory = [];
      
      for (const key of subCategoryKeys) {
        const value = formData.get(key)?.toString();
        if (value) {
          // Store as string ID
          productData.subCategory.push(value);
        }
      }
    }

    const productNameValue = formData.get('productName');
    if (productNameValue !== null) {
      productData.productName = productNameValue?.toString();
    }

    const shortDescriptionValue = formData.get('shortDescription');
    if (shortDescriptionValue !== null) {
      productData.shortDescription = shortDescriptionValue?.toString();
    }

    const featuresValue = formData.get('features');
    if (featuresValue !== null) {
      productData.features = featuresValue?.toString();
    }
    
    // Handle product image upload for updates
    const productImage = formData.get('productImage') as File;
    if (productImage && productImage.size > 0) {
      const uploadDir = join(process.cwd(), 'public/uploads/products');
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        console.log("Directory already exists or cannot be created");
      }
      
      // Generate unique filename
      const fileName = `${Date.now()}-${productImage.name.replace(/\s+/g, '-')}`;
      const filePath = join(uploadDir, fileName);
      
      // Write file to disk
      const imageBuffer = await productImage.arrayBuffer();
      await writeFile(filePath, Buffer.from(imageBuffer));
      
      // Store relative path in database
      productData.productImage = `/uploads/products/${fileName}`;
    }
    
    // Process descriptions for update
    const descriptions: { title: string | null; heading: string | null; desc: string | null }[] = [];
    let index = 0;
    while (formData.has(`descriptions[${index}][title]`) || 
           formData.has(`descriptions[${index}][heading]`) || 
           formData.has(`descriptions[${index}][desc]`)) {
      
      descriptions.push({
        title: formData.get(`descriptions[${index}][title]`)?.toString() || null,
        heading: formData.get(`descriptions[${index}][heading]`)?.toString() || null,
        desc: formData.get(`descriptions[${index}][desc]`)?.toString() || null
      });
      
      index++;
    }
    
    if (descriptions.length > 0) {
      productData.descriptions = descriptions;
    }
    
    // Process PDF uploads for update
    const pdfs: { heading: string | null; file?: string | null }[] = [];
    index = 0;
    while (formData.has(`pdfs[${index}][heading]`)) {
      const pdfFile = formData.get(`pdfs[${index}][file]`) as File;
      const pdfHeading = formData.get(`pdfs[${index}][heading]`)?.toString() || null;
      const existingFileUrl = formData.get(`pdfs[${index}][fileUrl]`)?.toString() || null;
      
      const pdfEntry: { heading: string | null; file?: string | null } = {
        heading: pdfHeading
      };
      
      // If a new file is uploaded, process it
      if (pdfFile && pdfFile.size > 0) {
        const uploadDir = join(process.cwd(), 'public/uploads/pdfs');
        
        // Ensure upload directory exists
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch {
          console.log("Directory already exists or cannot be created");
        }
        
        // Generate unique filename
        const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, fileName);
        
        // Write file to disk
        const pdfBuffer = await pdfFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(pdfBuffer));
        
        // Store relative path in database
        pdfEntry.file = `/uploads/pdfs/${fileName}`;
      } 
      // If no new file but has existing file URL, keep the existing one
      else if (existingFileUrl) {
        pdfEntry.file = existingFileUrl;
      }
      
      pdfs.push(pdfEntry);
      index++;
    }
    
    if (pdfs.length > 0) {
      productData.pdfs = pdfs;
    }
    
    console.log("Product update data:", productData);
    
    const product = await Product.findByIdAndUpdate(id, productData, { new: true });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product updated", product }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Error updating product", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().populate('category').populate({
      path: 'subCategory',
      model: 'SubCategory' // Explicitly specify the model name
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Error fetching products", error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const id = new URL(req.url).searchParams.get("id");
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted", product }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Error deleting product", error }, { status: 500 });
  }
}
