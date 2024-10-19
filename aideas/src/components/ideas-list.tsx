"use client"
import { ideaQuery, setIdeasMutation } from '@/hooks/ideas'
import { useApiKey } from '@/lib/api-key-provider'
import { useIdeaService } from '@/lib/idea-service-provider'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { signIn, signOut, useSession } from "next-auth/react"
import React, { PropsWithChildren } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

const IdeasList: React.FC<PropsWithChildren> = ({ children }) => {
    const { data: session, status: sessionStatus } = useSession()
    const ideaService = useIdeaService(state => state.service)
    const apiKeyState = useApiKey()
    const queryClient = useQueryClient()
    const ideas = ideaQuery.useQuery(ideaService)

    const setIdeas = setIdeasMutation.useMutation(ideaService, {
        onSuccess: () => {
            queryClient.invalidateQueries()
            toast.success('Cleared ideas')
        },
        onError: (error) => {
            console.log(error)
            toast.error('Failed to clear ideas: ' + error.message)
        }
    })
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle>Your saved ideas</SheetTitle>
                    {ideas.isLoading && <SheetDescription>Loading...</SheetDescription>}
                    <SheetDescription>
                        {ideas.data?.length} ideas
                    </SheetDescription>
                    {
                        ideas.data?.map((idea, index) => (
                            <SheetDescription key={index} className='flex flex-col'>
                                <small className='italic'>{idea.context}</small>
                                <span>{idea.idea}</span>
                            </SheetDescription>
                        ))
                    }
                    <SheetFooter className='flex flex-col gap-2'>
                        <Button onClick={() => {
                            setIdeas.mutate()
                        }} disabled={ideas.data?.length === 0}>Clear ideas</Button>

                        <Button onClick={() => {
                            apiKeyState.setApiKey('')
                        }}>Change API Key</Button>

                        {sessionStatus !== 'authenticated' ? (
                            <div className='flex flex-col gap-1'>
                                <Button className='bg-[#24292e] hover:bg-[#2b3137]' onClick={() => signIn("github")}><GitHubLogoIcon className='w-4 h-4 mr-2' />Sign in with GitHub</Button>
                                <SheetDescription>Sign in with GitHub to save your ideas to the cloud</SheetDescription>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-1'>
                                <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                                <SheetDescription>Signed in as {session.user?.name}</SheetDescription>
                            </div>
                        )}
                    </SheetFooter>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default IdeasList