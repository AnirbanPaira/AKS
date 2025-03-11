import mongoose, { Schema } from 'mongoose';

const TodoSchema = new Schema({
    task: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);

export default Todo;
