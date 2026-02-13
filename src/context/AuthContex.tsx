"use client";

import { account } from "@/Lib/appwrite";
import { Models } from "appwrite";
import {createContext, useContext,useState,useEffect} from "react";


type UserPrefs = {
    role: "user" | "admin";

};
type AuthContextType = {
    user:Models.User<UserPrefs>|null;
    loading:boolean;
    reloadUser:() => Promise<void>;
    isAdmin:boolean;
};

const AuthContext = createContext<AuthContextType>({
    user:null,
    loading:true,
    reloadUser:async () => {},
    isAdmin:false,
});

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user,setUser] = useState<Models.User<UserPrefs>|null>(null);
    const [loading,setLoading] = useState(true);

    const loadUser = async () =>{
        setLoading(true);
        try{
            const currentUser = await account.get<UserPrefs>();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    },[]);

    const isAdmin = user?.prefs.role === "admin";

    return (
        <AuthContext.Provider value={{user,loading,reloadUser:loadUser,isAdmin}}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);