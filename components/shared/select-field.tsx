"use client"
import { Label } from "@/components/ui/label"

interface SelectFieldProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
}

export function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
