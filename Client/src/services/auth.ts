import api from "./api";
import type { IUser } from "@/types";

export const login = async (email: string, password: string): Promise<{ token: string; user: IUser }> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data.data;
};

export const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}): Promise<{ token: string; user: IUser }> => {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
};
