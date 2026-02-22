import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  icon?: ReactNode
}

export function FormField({ label, id, icon, className, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground">{label}</Label>
      {icon ? (
        <div className="relative">
          <div className="absolute left-3 top-3 text-muted-foreground">{icon}</div>
          <Input id={id} className={`pl-9 ${className || ""}`} {...props} />
        </div>
      ) : (
        <Input id={id} className={className} {...props} />
      )}
    </div>
  )
}
