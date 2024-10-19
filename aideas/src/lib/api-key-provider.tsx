"use client"

import { create } from 'zustand';

interface ApiKeyState {
    apiKey: string;
    setApiKey: (apiKey: string) => void;
}

export const useApiKey = create<ApiKeyState>((set) => ({
    get apiKey() {
        return typeof sessionStorage !== "undefined" ? sessionStorage.getItem('apiKey') ?? '' : ''
    },
    setApiKey: (apiKey: string) => {
        sessionStorage.setItem('apiKey', apiKey)
        set((state) => ({ ...state, apiKey, isDialogOpen: false }))
    },
})) 