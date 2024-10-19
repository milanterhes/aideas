"use client";

import { Idea, IdeaService } from '@/lib/ideas';
import { MutationOptions, QueryOptions, useMutation, useQuery } from '@tanstack/react-query';

export const ideaQuery = {
    queryKey: ['local-ideas'],
    useQuery: (ideaService: IdeaService, options?: QueryOptions<Idea[]>) => useQuery({
        ...options,
        queryKey: ['local-ideas'],
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
    useMutation: (ideaService: IdeaService, options?: MutationOptions<void, Error, Idea[]>) => useMutation({
        mutationKey: ['set-ideas'],
        mutationFn: (ideas) => ideaService.setIdeas(ideas),
        ...options,
    }),
    mutationKey: ['set-ideas'],
}