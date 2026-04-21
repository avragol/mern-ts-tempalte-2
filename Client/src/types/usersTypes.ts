export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    role: 'admin' | 'user';
    createdAt?: string;
    updatedAt?: string;
}
