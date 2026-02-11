/**
 * Shared filter logic hook
 */

import { useMemo } from "react";
import type { Car } from "@/lib/types";

export interface FilterOptions {
  search: string;
  plate: string;
  brand: string;
  model: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * Filter cars based on multiple criteria
 */
export function useFilteredCars(cars: Car[], filters: FilterOptions): Car[] {
  return useMemo(() => {
    let filtered = [...cars];

    // Search filter (matches name, phone, or email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.name.toLowerCase().includes(searchLower) ||
          car.phone?.toLowerCase().includes(searchLower) ||
          car.email?.toLowerCase().includes(searchLower)
      );
    }

    // Plate filter
    if (filters.plate) {
      const plateLower = filters.plate.toLowerCase();
      filtered = filtered.filter((car) =>
        car.plate.toLowerCase().includes(plateLower)
      );
    }

    // Brand filter
    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      filtered = filtered.filter((car) =>
        car.brand.toLowerCase().includes(brandLower)
      );
    }

    // Model filter
    if (filters.model) {
      const modelLower = filters.model.toLowerCase();
      filtered = filtered.filter((car) =>
        car.model.toLowerCase().includes(modelLower)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter((car) => car.checkInAt >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      // Add 24 hours to include the entire end date
      const endOfDay = toDate + 24 * 60 * 60 * 1000 - 1;
      filtered = filtered.filter((car) => car.checkInAt <= endOfDay);
    }

    return filtered;
  }, [cars, filters]);
}
