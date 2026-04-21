import type { Document, Model } from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    email: string;
    role: 'admin' | 'user';
}

export interface IUserDoc extends IUser, Document {
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserModel extends Model<IUserDoc> {
    findByEmail(email: string): Promise<IUserDoc | null>;
}
