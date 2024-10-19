"use client"

import { create } from 'zustand';
import { IdeaService, LocalIdeaService } from './ideas';

interface IdeaServiceState {
    service: IdeaService;
    setLocal: () => void
}

export const useIdeaService = create<IdeaServiceState>((set) => ({
    service: new LocalIdeaService(),
    setLocal: () => {
        set((state) => ({ ...state, service: new LocalIdeaService() }))
    }
})) 