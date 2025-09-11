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
import { motion } from "framer-motion"

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-10 max-w-2xl w-full text-center"
    >
      <p className="text-2xl sm:text-3xl font-semibold 
                   text-[#10b981] 
                   animate-pulse drop-shadow-[0_0_10px_#10b981aa]">
        {message}
      </p>
    </motion.div>
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
    const [step, setStep] = useState<number>(1)   // 🔹 Step control
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [answers, setAnswers] = useState<string[]>([]) // 🔹 store user answers
    const [questions, setQuestions] = useState<
        { id: string; text: string; minLength?: number; required?: boolean }[]
    >([])
    const [references, setReferences] = useState<{ text: string; percent: number }[]>([])
    const [showReferenceModal, setShowReferenceModal] = useState(false)
    const [refFile, setRefFile] = useState<File | null>(null)

    const openModal = () => setShowUploadModal(true)
    const closeModal = () => setShowUploadModal(false)

    // Fake API call
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return
        console.log("Uploading file:", file);


        setLoading(true)
        setMessage("Thinking...")

        try {
            // 🔹 Replace with real backend call
            const fakeApiResponse = await new Promise(resolve =>
                setTimeout(() => {
                    resolve([
                        { id: "q1", text: "What is the topic of your assignment?", minLength: 10, required: true },
                        { id: "q2", text: "What challenges are you facing?", minLength: 15, required: true },
                        { id: "q3", text: "What outcome do you expect?", minLength: 5, required: false }
                    ])
                }, 2000)
            )

            setQuestions(fakeApiResponse as any)
            setAnswers([]) // reset
            setStep(2)     // go to step 2
            setMessage("")
        } catch (err) {
            setMessage("❌ Failed to upload file.")
        } finally {
            setLoading(false)
            setShowUploadModal(false)
            setFile(null)
        }
    }

    const handleAnswerChange = (index: number, value: string) => {
        const updated = [...answers]
        updated[index] = value
        setAnswers(updated)
    }

    const handleAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            const ans = answers[i] || ""

            if (q.required && ans.trim().length === 0) {
                setMessage(`⚠️ Answer required for: "${q.text}"`)
                return
            }

            if (q.minLength && ans.trim().length < q.minLength) {
                setMessage(`⚠️ Answer for "${q.text}" must be at least ${q.minLength} characters.`)
                return
            }
        }

        setMessage("Thinking...")
        setTimeout(() => {
            setMessage("Validating your answers...")
        }, 1500)

        setMessage("Generating references...")
        // Fake api call
        setTimeout(() => {
            setStep(3)
            setMessage("")
            // 🔹 Fake backend response for references
            setReferences([
                { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...", percent: 86 },
                { text: "Duis aute irure dolor in reprehenderit in voluptate...", percent: 72 },
                { text: "Ut enim ad minim veniam, quis nostrud exercitation...", percent: 65 },
                { text: "Sed ut perspiciatis unde omnis iste natus error...", percent: 54 },
                { text: "At vero eos et accusamus et iusto odio dignissimos...", percent: 49 },
            ])
        }, 3000)
    }


    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-900">

            {/* Backend response */}
            <BackendMessage message={message} />

            {/* ---------------- Step 1: Upload File ---------------- */}
            {step === 1 && (
                <>
                    {/* Greeting */}
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-gray-100">
                            Hi <span className='text-[var(--color-accent-primary)]'>
                                {user?.name.split(' ')[0] || 'User'}
                            </span>,
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                            Let’s start working on your assignments!
                        </p>
                    </div>
                    {showUploadModal ? (
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center 
                                         border-2 border-dashed border-gray-300 dark:border-gray-700 
                                         p-6 cursor-pointer hover:border-[var(--color-accent-primary)] 
                                         transition-colors w-[40vw] rounded-2xl"
                            >
                                <svg className="w-10 h-10 mb-3 text-gray-400"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                    </path>
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
                        </form>
                    ) : (
                        <div className="mt-10">
                            <UploadFile openModal={openModal} />
                        </div>
                    )}
                </>
            )}

            {/* ---------------- Step 2: Show Questions ---------------- */}
            {step === 2 && (
                <form onSubmit={handleAnswerSubmit} className="mt-10 space-y-6 max-w-2xl w-full">
                    {questions.map((q, i) => (
                        <div key={q.id}>
                            <label className="block mb-2 text-gray-700 dark:text-gray-300">
                                {q.text}{" "}
                                {q.minLength && (
                                    <span className="text-sm text-gray-500">(min {q.minLength} chars)</span>
                                )}
                            </label>
                            <Textarea
                                rows={3}
                                value={answers[i] || ""}
                                onChange={(e) => handleAnswerChange(i, e.target.value)}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 p-3"
                                placeholder="Type your answer..."
                                required={q.required}
                            />
                        </div>
                    ))}

                    <div className="flex justify-center">
                        <Button type="submit">Submit Answers</Button>
                    </div>
                </form>
            )}

            {/* ---------------- Step 3: References ---------------- */}
            {step === 3 && (
                <div className="mt-10 max-w-2xl w-full">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
                        References
                    </h3>
                    <ul className="space-y-4">
                        {references.map((ref, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                            >
                                <span className="text-gray-700 dark:text-gray-200 truncate max-w-[70%]">
                                    {i + 1}. {ref.text}
                                </span>
                                <span className="text-[var(--color-accent-primary)] font-semibold">
                                    {ref.percent}%
                                </span>
                            </li>
                        ))}

                        {/* Add your own reference */}
                        <li
                            onClick={() => setShowReferenceModal(true)}
                            className="flex gap-x-5 items-center cursor-pointer bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-gray-700 border-2 border-dotted border-primary rounded-full p-2 dark:text-gray-200">
                                <Plus />
                            </span>
                            <span className="text-gray-700 dark:text-gray-200">Add your own reference</span>
                        </li>
                    </ul>

                    {/* Upload Reference Modal */}
                    <Dialog open={showReferenceModal} onOpenChange={setShowReferenceModal}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Upload Reference</DialogTitle>
                                <DialogDescription>
                                    Upload a PDF, DOCX, or TXT file (max 10MB) as your reference.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    if (!refFile) return
                                    // Fake insert into references
                                    setReferences(prev => [
                                        ...prev,
                                        { text: refFile.name, percent: Math.floor(Math.random() * 40) + 50 }
                                    ])
                                    setRefFile(null)
                                    setShowReferenceModal(false)
                                }}
                                className="space-y-4"
                            >
                                <label
                                    htmlFor="ref-upload"
                                    className="flex flex-col items-center justify-center 
                                   border-2 border-dashed border-gray-300 dark:border-gray-700 
                                   p-6 cursor-pointer hover:border-[var(--color-accent-primary)] 
                                   transition-colors rounded-2xl"
                                >
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag & drop
                                    </p>
                                    <p className="text-xs text-gray-400">PDF, DOCX, TXT up to 10MB</p>
                                    <input
                                        id="ref-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setRefFile(e.target.files?.[0] || null)}
                                    />
                                </label>

                                {refFile && (
                                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                        Selected: {refFile.name}
                                    </p>
                                )}

                                <div className="flex justify-center">
                                    <Button type="submit">
                                        Add Reference
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )
}

