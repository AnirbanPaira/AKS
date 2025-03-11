import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import  connectMongoDB  from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { currentPassword, newPassword, email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: "User not found with this email." }, { status: 404 });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
    }

    user.password = newPassword; // Password will be hashed by the mongoose middleware
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ message: "Failed to update password." }, { status: 500 });
  }
}
