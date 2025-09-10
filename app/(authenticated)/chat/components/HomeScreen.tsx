'use client'

import React, { useState } from 'react'
import { useAuth } from '@/app/components/loginModal/functions'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'

/* ------------------ Upload Button ------------------ */
export function UploadFile({ openModal }: { openModal: () => void }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className="rounded-full h-16 w-16 border-2 border-dotted 
                       border-[var(--color-accent-primary)] flex items-center 
                       justify-center hover:bg-[var(--color-accent-primary)]/10 
                       transition-colors duration-200 shadow-md"
                        onClick={openModal}
                    >
                        <Plus className="h-7 w-7 text-gray-700 dark:text-gray-200" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Upload your file</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

/* ------------------ Backend Response ------------------ */
export function BackendMessage({ message }: { message: string }) {
    if (!message) return null
    return (
        <div className="mt-10 max-w-lg w-full">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <p className="text-base text-center text-gray-700 dark:text-gray-200 animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    )
}

/* ------------------ Chat Input ------------------ */
export function TextareaDemo() {
    return (
        <div className="fixed bottom-6 left-0 lg:left-64 right-0 px-4 lg:px-6">
            <div className="max-w-3xl mx-auto">
                <Textarea
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 
                     shadow-sm bg-white dark:bg-gray-800 resize-none p-4"
                    placeholder="Type your message here..."
                    rows={3}
                />
            </div>
        </div>
    )
}



/* ------------------ Main Screen ------------------ */
export default function HomeScreen() {
    const { user } = useAuth()
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const openModal = () => setShowUploadModal(true)
    const closeModal = () => setShowUploadModal(false)

    // Fake API call
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return
        console.log(file);

        setLoading(true)
        setMessage("Uploading...")

        setTimeout(() => {
            setMessage("🤖 Thinking about your assignment...")
            setShowUploadModal(false)
            setFile(null)
            setLoading(false)
            // todo: Call your backend API here
        }, 2000)
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center 
                    px-6 py-12 bg-gray-50 dark:bg-gray-900">
            {/* Greeting */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl
                       text-gray-900 dark:text-gray-100">
                    Hi <span className='text-[var(--color-accent-primary)]'>{user?.name.split(' ')[0] || 'User'}</span>,
                </h2>
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                    Let’s start working on your assignments!
                </p>
            </div>


            {/* Upload */}
            {showUploadModal ? (<form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center 
                         border-2 border-dashed border-gray-300 dark:border-gray-700 
                         p-6 cursor-pointer hover:border-[var(--color-accent-primary)] 
                         transition-colors w-[40vw] rounded-2xl"
                >
                    <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX, TXT up to 10MB</p>
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </label>

                {file && (
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Selected: {file.name}
                    </p>
                )}

                <div className="flex justify-center">
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </Button>
                </div>
            </form>) : <div className="mt-10">
                <UploadFile openModal={openModal} />
            </div>}
            {/* Backend response */}
            <BackendMessage message={message} />

            {/* Chat input */}
            {/* <TextareaDemo /> */}
        </div>
    )
}
