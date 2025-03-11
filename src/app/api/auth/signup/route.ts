import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Invalid Credentials" }, { status: 400 });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        // Don't hash the password here, let the model handle it
        await User.create({ email, password });

        
        // Dummy token for now
        const token = 'dummy_token';

        const response = NextResponse.json({ message: "User created successfully", token }, { status: 201 });
        return response;

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "Error signing up user" }, { status: 500 });
    }
}
