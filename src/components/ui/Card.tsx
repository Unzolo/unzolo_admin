import * as React from "react"

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={`rounded-3xl border border-gray-100 bg-white shadow-sm ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <h3 className={`text-2xl font-bold leading-none tracking-tight text-gray-900 ${className}`}>
            {children}
        </h3>
    )
}

export function CardDescription({ className, children }: { className?: string, children: React.ReactNode }) {
    return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}

export function CardFooter({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
}
