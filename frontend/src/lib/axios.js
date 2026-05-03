import axios from "axios"

//create an axios instance
export const axiosInstance = axios.create({
    baseURL:"http://localhost:5001/api",
    withCredentials:true  //this means send cookies with the request
})