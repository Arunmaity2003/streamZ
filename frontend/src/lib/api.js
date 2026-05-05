import { axiosInstance } from "./axios.js"

export const signup = async (signUpData) => {
    const response = await axiosInstance.post("/auth/signUp", signUpData)
    return response.data
}

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData)
    return response.data
}

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout")
    return response.data
}

export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me")
        return res.data;
    } catch (error) {
        console.log("Error getAuthUser: ",error)
        return null;
    }
}

export const completeOnboarding = async (userData) => {
    const response = await axiosInstance.post("/auth/onboarding",userData)
    return response.data
}