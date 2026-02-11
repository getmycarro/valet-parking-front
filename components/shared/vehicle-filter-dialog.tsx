"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export interface FilterState {
  search: string
  plate: string
  brand: string
  model: string
  dateFrom: string
  dateTo: string
}

interface VehicleFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClear: () => void
}

export function VehicleFilterDialog({ open, onOpenChange, filters, onFiltersChange, onClear }: VehicleFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Vehicles</DialogTitle>
          <DialogDescription>
            Filter vehicles by various criteria
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search (Name, Phone, Email)</Label>
            <Input
              id="search"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Search..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">Plate</Label>
            <Input
              id="plate"
              value={filters.plate}
              onChange={(e) => onFiltersChange({ ...filters, plate: e.target.value })}
              placeholder="ABC123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={filters.brand}
                onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
                placeholder="Toyota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={filters.model}
                onChange={(e) => onFiltersChange({ ...filters, model: e.target.value })}
                placeholder="Camry"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClear}>
            Clear Filters
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
