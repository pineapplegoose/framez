'use client'
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from "../config/supabase"
import * as Linking from "expo-linking";

const redirectTo = Linking.createURL("/auth/callback");

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!supabase) return;

        // 1️⃣ Handle session on app load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2️⃣ Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        // 3️⃣ 🔥 Handle deep link redirects (Step 4)
        const handleDeepLink = async (event: { url: string }) => {
            const { url } = event;
            console.log("Deep link opened:", url);
            if (!supabase) return;

            // Tell Supabase to parse the link and complete the auth session
            const { data, error } = await supabase.auth.exchangeCodeForSession(url);
            if (error) {
                console.error("Error handling deep link:", error.message);
                return;
            }

            console.log("Session after deep link:", data.session);
            setSession(data.session);
            setUser(data.session?.user ?? null);
        };

        // 4️⃣ Listen for incoming links
        const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

        // 5️⃣ Check if the app was opened with a link already
        (async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                console.log("Initial URL:", initialUrl);
                await handleDeepLink({ url: initialUrl });
            }
        })();

        // Cleanup all subscriptions
        return () => {
            subscription.unsubscribe();
            linkingSubscription.remove();
        };
    }, [supabase]);


    const signUp = async (email: string, password: string, displayName: string) => {
        if (!supabase) {
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
                emailRedirectTo: redirectTo
            },
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert('Account created! Please check your email.');
    };

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const logout = async () => {
        if (!supabase) {
            return
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};