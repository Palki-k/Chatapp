import { createContext, use, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import {io} from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl


export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUser, setOnlineUser] = useState([])
    const [socket, setSocket] = useState(null)

    // Check if the user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () =>{
        try {
            const {data} = await axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
           toast.error(error.message) 
        }
    }


    // Login function to handle user authentication and socket connection
    const login = async(state, credentials) =>{
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token)
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }else{ 
                toast.error(data.message)
            }
        } catch (error) {
             toast.error(error.message)
            }
    }
    


    //Logout function to handle user logout and socket disconnection
    const logout = async() =>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out sucessfully");
        socket.disconnect();
    }
    
    //update profile function to handle user profilr update

     const updateFile = async (body) =>{
        try {
            const {data} = await axios.put("/api/auth/update-profile", body)
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated Sucessfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
     }

    //Connect socket function to handle socket connection and online users update
    const connectSocket = (userData) =>{
        if(!userData || socket) return;   //it means socket connection is false
        const newSocket = io(backendUrl, {
            query: {
                userId:userData._id
            }
        }) 
        newSocket.connect();
        setSocket(newSocket)

       newSocket.on("getOnlineUser", (users) => {
       console.log("Online users received:", users);
       setOnlineUser(users);
    });

    }

    useEffect( ()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth()
    }, [])

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateFile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}