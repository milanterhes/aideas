import { ideaQuery, setIdeasMutation } from '@/hooks/local-ideas'
import { useIdeaService } from '@/lib/idea-service-provider'
import { useQueryClient } from '@tanstack/react-query'
import React, { PropsWithChildren } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { useApiKey } from '@/lib/api-key-provider'

const IdeasList: React.FC<PropsWithChildren> = ({ children }) => {
    const ideaService = useIdeaService(state => state.service)
    const ideas = ideaQuery.useQuery(ideaService)
    const queryClient = useQueryClient()
    const apiKeyState = useApiKey()
    const setIdeas = setIdeasMutation.useMutation(ideaService, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                exact: true,
                queryKey: ideaQuery.queryKey,
            })
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
                            setIdeas.mutate([])
                        }} disabled={ideas.data?.length === 0}>Clear ideas</Button>
                        <Button onClick={() => {
                            apiKeyState.setDialogOpen(true)
                        }}>Change API Key</Button>
                        <div className='flex flex-col gap-1'>
                            <Button><GitHubLogoIcon className='w-4 h-4 mr-2' />Sign in with GitHub</Button>
                            <SheetDescription>Sign in with GitHub to save your ideas to the cloud</SheetDescription>
                        </div>
                    </SheetFooter>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default IdeasList