import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";



const subTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Type.ObjectId,
        ref: "Task",
        required:true
    },
    
    isCompleted: {
        type: Boolean,
        default:false
    },
    createdBy: {
        type: Schema.TYpes.ObjectId,
        ref: "User",
        required:true
    }

}, { timestamps });

export const SubTask = mongoose.model("SubTask", subtaskSchema);


