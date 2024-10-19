"use client"

import { create } from 'zustand';
import { IdeaService, LocalIdeaService, RemoteIdeaService } from './ideas';

interface IdeaServiceState {
    service: IdeaService;
    setLocal: () => void
    setRemote: () => void
}

export const useIdeaService = create<IdeaServiceState>((set) => ({
    service: new LocalIdeaService(),
    setLocal: () => {
        set((state) => ({ ...state, service: new LocalIdeaService() }))
    },
    setRemote: () => {
        set((state) => ({ ...state, service: new RemoteIdeaService() }))
    }
})) 