import mongoose, { Schema } from "mongoose";
import type { IUserDoc, IUserModel } from "../types/index.js";

const userSchema = new Schema<IUserDoc>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    profilePicture: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], required: true, default: 'user' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.statics.findByEmail = async function(email: string) {
    return this.findOne({ email }).select('+password');
};

const UserModel = mongoose.model<IUserDoc, IUserModel>("User", userSchema);
export default UserModel;
