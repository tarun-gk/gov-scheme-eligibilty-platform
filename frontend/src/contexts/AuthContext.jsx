import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { apiLogin, apiSignup, apiGetMe, apiRefreshToken, apiLogout, setAccessToken } from "../services/platformApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiRefreshToken()
            .then((refreshData) => {
                const accessToken = refreshData.accessToken || refreshData.token || null;

                if (!accessToken) {
                    setAccessToken(null);
                    setToken(null);
                    setUser(null);
                    return null;
                }

                setAccessToken(accessToken);
                setToken(accessToken);
                return apiGetMe(accessToken);
            })
            .then((meData) => {
                if (meData?.user) {
                    setUser(meData.user);
                }
            })
            .catch(() => {
                setAccessToken(null);
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await apiLogin(email, password);
        setAccessToken(data.accessToken || data.token || null);
        setToken(data.accessToken || data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const data = await apiSignup(name, email, password);
        setAccessToken(data.accessToken || data.token || null);
        setToken(data.accessToken || data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setAccessToken(null);
        apiLogout().catch(() => {});
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: Boolean(user && token),
            isAdmin: user?.role === "admin",
            login,
            signup,
            logout,
        }),
        [user, token, loading, login, signup, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
