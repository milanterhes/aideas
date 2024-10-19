"use client";

import useChat from '@/hooks/use-chat';
import { useApiKey } from '@/lib/api-key-provider';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReloadIcon } from '@radix-ui/react-icons';
import { HardDrive, Send, User } from 'lucide-react';
import OpenAI from 'openai';
import React from 'react';
import { useForm } from 'react-hook-form';
import Markdown from "react-markdown";
import { z } from 'zod';
import IdeasList from './ideas-list';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

export const Chat = () => {
    const apiKeyState = useApiKey()
    const { isStreaming, messages, sendPrompt, streamingMessage } = useChat(apiKeyState.apiKey ?? "")

    return (
        <div className="h-screen flex flex-col">
            <nav className="flex flex-col-reverse md:grid md:grid-cols-3 px-3 my-3">
                <div className='flex items-center justify-center md:justify-start'>
                    <IdeasList>
                        <Button><HardDrive className='w-4 h-4' />Saved ideas</Button>
                    </IdeasList>
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold">AIdeas</h1>
                    <p className="text-lg mb-4">
                        AIdeas is a chatbot that helps you generate ideas.
                    </p>
                </div>
            </nav>
            <div className="container mx-auto flex flex-col flex-grow">
                <div className="flex flex-col flex-grow my-4">
                    <ScrollArea className="h-0 flex-grow px-2">
                        {messages.length === 1 && (
                            <MessageBubble
                                message={{
                                    role: 'assistant',
                                    content: 'I am a helpful assistant that generates ideas for you. You can ask me to generate ideas for you.',
                                }}
                            />
                        )}
                        <div className="flex flex-col gap-2">
                            {messages.map((message, index) => (
                                <MessageBubble key={index} message={message} />
                            ))}
                            {streamingMessage && (
                                <MessageBubble
                                    message={{ role: 'assistant', content: streamingMessage }}
                                />
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <div className="container mx-auto px-1 md:px-0">
                <MessageInput onMessage={sendPrompt} isLoading={isStreaming} />
            </div>
            <ApiKeyDialog />
        </div>
    )
}

const startChatFormSchema = z.object({
    message: z.string().min(5, {
        message: "The message must be at least 5 characters.",
    }),
})

interface MessageInputProps extends React.InputHTMLAttributes<HTMLFormElement> {
    onMessage: (message: string) => void
    isLoading?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessage, isLoading, className, ...props }) => {
    const form = useForm<z.infer<typeof startChatFormSchema>>({
        resolver: zodResolver(startChatFormSchema),
        defaultValues: {
            message: '',
        },
    })

    const onSubmit = (data: z.infer<typeof startChatFormSchema>) => {
        form.reset()
        onMessage(data.message)
    }

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-2 flex flex-col my-2", className)} {...props}>
            <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea {...field} placeholder="Ask for some ideas..." />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {isLoading ? (
                <Button disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                </Button>
            ) : (<Button type='submit'><Send className='h-4 w-4' /></Button>)}
        </form>
    </Form>
}

interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
    message: OpenAI.Chat.Completions.ChatCompletionMessageParam
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, className, ...props }) => {
    const content = typeof message.content === 'string' ? message.content : message.content?.join('')
    if (message.role === 'system') {
        return null
    }
    return (
        <div className={cn('flex items-start mb-4', message.role === "user" ? "justify-end" : "justify-start", className)} {...props}>
            {message.role === "assistant" && (
                <Avatar className="mr-2">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}
            <Card className={cn('p-3 max-w-[70%]', message.role === "user" ? "bg-primary" : "bg-secondary")}>
                <Markdown>
                    {content}
                </Markdown>
            </Card>
            {message.role === "user" && (
                <Avatar className="ml-2">
                    <AvatarFallback>
                        <User />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

const ApiKeyDialogFormSchema = z.object({
    apiKey: z.string().min(5, {
        message: "The API key must be at least 5 characters.",
    }),
})

const ApiKeyDialog = () => {
    const apiKeyState = useApiKey()
    const form = useForm<z.infer<typeof ApiKeyDialogFormSchema>>({
        resolver: zodResolver(ApiKeyDialogFormSchema),
        defaultValues: {
            apiKey: apiKeyState.apiKey,
        },
    });

    const onSubmit = (data: z.infer<typeof ApiKeyDialogFormSchema>) => {
        form.reset()
        apiKeyState.setApiKey(data.apiKey)
    }

    return <Dialog open={apiKeyState.apiKey === ''} onOpenChange={() => {
        // only close the dialog if the API key is set
        if (!apiKeyState.apiKey) {
            return
        }
    }}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Set your OpenAI API Key</DialogTitle>
                <DialogDescription>
                    To use the AIdeas chatbot, you need to set your OpenAI API key. You can get your API key from the OpenAI dashboard.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-2 flex flex-col my-2")}>
                    <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} placeholder="sk-proj-...." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
}