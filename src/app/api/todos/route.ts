import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Todo from '../../../../models/Todo';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const todo = await Todo.create(body);
        return NextResponse.json({ todo }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating todo", error }, { status: 500 });
    }
}

export async function GET() {
    await dbConnect();
    try {
        const todos = await Todo.find();
        return NextResponse.json({ todos }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching todos", error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    try {
        const id = req.url.split('/todos/')[1];
        await Todo.findByIdAndDelete(id);
        return NextResponse.json({ message: "Todo deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting todo", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await dbConnect();
    try {
        const id = req.url.split('/todos/')[1];
        const body = await req.json();
        const updatedTodo = await Todo.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ todo: updatedTodo }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error updating todo", error }, { status: 500 });
    }
}
