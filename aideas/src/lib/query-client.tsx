"use client";
import { QueryClient, QueryClientProvider as Provider } from '@tanstack/react-query';
import React, { PropsWithChildren } from 'react'

const queryClient = new QueryClient()

const QueryClientProvider: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Provider client={queryClient}>
            {children}
        </Provider>
    )
}

export default QueryClientProvider