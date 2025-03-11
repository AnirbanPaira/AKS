import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        const passwordToCheck = String(password).trim();
        console.log("Input password (after trim):", passwordToCheck);
        console.log("Stored hashed password:", user.password);
        
        try {
            const isPasswordMatch = await bcrypt.compare(passwordToCheck, user.password);
            console.log("Password Match Result:", isPasswordMatch);
            
            if (!isPasswordMatch) {
                return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
            }

            // Dummy token for now
            const token = 'dummy_token';

            // Return token in the response body
            return NextResponse.json({ token }, { status: 200 });


        } catch (bcryptError) {
            console.error("Bcrypt comparison error:", bcryptError);
            return NextResponse.json({ message: "Authentication error" }, { status: 500 });
        }
    } catch (error) {
        console.error("Database connection error in signin:", error);
        return NextResponse.json({ message: "Error signing in", error }, { status: 500 });
    }
}
