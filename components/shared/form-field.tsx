import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function FormField({ label, id, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  )
}
