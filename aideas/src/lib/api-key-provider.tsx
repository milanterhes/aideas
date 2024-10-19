"use client"

import { create } from 'zustand';

interface ApiKeyState {
    apiKey: string;
    setApiKey: (apiKey: string) => void;
    isDialogOpen: boolean;
    setDialogOpen: (isOpen: boolean) => void;
}

export const useApiKey = create<ApiKeyState>((set) => ({
    apiKey: '',
    setApiKey: (apiKey: string) => {
        set((state) => ({ ...state, apiKey, isDialogOpen: false }))
    },
    isDialogOpen: true,
    setDialogOpen: (isOpen: boolean) => {
        set((state) => ({ ...state, isDialogOpen: isOpen }))
    },
})) 