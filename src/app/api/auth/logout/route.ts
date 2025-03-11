import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
        response.cookies.delete('authToken');
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ message: "Error logging out" }, { status: 500 });
    }
}
