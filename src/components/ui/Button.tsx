import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger' }>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-primary-normal text-white hover:opacity-90 shadow-md',
            outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
            ghost: 'hover:bg-gray-100 text-gray-600',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
            danger: 'bg-red-500 text-white hover:bg-red-600'
        }
        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
