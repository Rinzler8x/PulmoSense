// src/components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

// This component is for a basic HTML select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange: (value: string) => void
}

// Basic Select (HTML select element)
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

// For the custom styled select (separate from HTML select)
export interface CustomSelectProps {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
}

// Custom select container (not an actual HTML select)
export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  children, 
  value, 
  onValueChange 
}) => {
  const [open, setOpen] = React.useState(false)

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              setOpen(!open)
            },
          })
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return open ? React.cloneElement(child as React.ReactElement<any>, {}) : null
        }
        return child
      })}
    </div>
  )
}

// Select trigger (button that opens the dropdown)
export const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
SelectTrigger.displayName = "SelectTrigger"

// The text shown in the select button
export const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("flex-grow text-sm", className)}
      {...props}
    />
  )
)
SelectValue.displayName = "SelectValue"

// The dropdown content
export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
        className
      )}
      {...props}
    />
  )
)
SelectContent.displayName = "SelectContent"

// Individual select items
export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, value, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center py-1.5 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={(e) => {
        if (onClick) onClick(e)
      }}
      data-value={value}
      {...props}
    />
  )
)
SelectItem.displayName = "SelectItem"