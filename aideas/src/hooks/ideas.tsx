"use client";

import { Idea, IdeaService } from '@/lib/ideas';
import { MutationOptions, QueryOptions, useMutation, useQuery } from '@tanstack/react-query';

export const ideaQuery = {
    queryKey: ['ideas'],
    useQuery: (ideaService: IdeaService, options?: QueryOptions<Idea[]>) => useQuery({
        ...options,
        queryKey: ['ideas'],
        queryFn: ideaService.getIdeas,
    })
}

export const addRawIdeasMutation = {
    useMutation: (ideaService: IdeaService, options?: MutationOptions<void, Error, string>) => useMutation({
        mutationKey: ['add-raw-ideas'],
        mutationFn: (rawIdeas) => ideaService.addRawIdeas(rawIdeas),
        ...options,
    }),
    mutationKey: ['add-raw-ideas'],
}

export const setIdeasMutation = {
    useMutation: (ideaService: IdeaService, options?: MutationOptions<void, Error>) => useMutation({
        mutationKey: ['set-ideas'],
        mutationFn: () => ideaService.resetIdeas(),
        ...options,
    }),
    mutationKey: ['set-ideas'],
}