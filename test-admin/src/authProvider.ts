import { AuthProvider } from "react-admin";
import axios from "axios";

export const authProvider: AuthProvider = {
    login: async ({ username, password }) => {
        try {
            const response = await axios.post('http://localhost:8080/api/login', {
                email: username,
                password: password,
            });
            const token = response.data["jwt-token"];
            localStorage.setItem("jwt-token", token);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(new Error("Login failed"));
        }
    },
    logout: () => {
        localStorage.removeItem("jwt-token");
        return Promise.resolve();
    },
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem("jwt-token");
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: () => localStorage.getItem("jwt-token") ? Promise.resolve() : Promise.reject(),
    getPermissions: () => Promise.resolve(),
};