"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  vehiclesService,
  type ParkingRecord,
  type VehicleFilterParams,
  type VehiclesListResponse,
} from "@/lib/services/vehicles-service";
import { useDebounce } from "./use-debounce";

const DEFAULT_META = { page: 1, limit: 20, total: 0, totalPages: 0, active: 0, pending_delivery: 0, completed: 0 };

export function useVehicles(
  initialFilters: VehicleFilterParams = { page: 1, limit: 20, status: "active" },
) {
  const [filters, setFiltersRaw] = useState<VehicleFilterParams>(initialFilters);
  const [data, setData] = useState<ParkingRecord[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestId = useRef(0);

  // Only debounce text-based search fields
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedPlate = useDebounce(filters.plate, 400);
  const debouncedBrand = useDebounce(filters.brand, 400);
  const debouncedModel = useDebounce(filters.model, 400);
  const debouncedColor = useDebounce(filters.color, 400);

  const fetchVehicles = useCallback(async (params: VehicleFilterParams) => {
    const currentId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const response: VehiclesListResponse = await vehiclesService.getAll(params);
      if (currentId === requestId.current) {
        setData(response.data);
        setMeta(response.meta);
      }
    } catch (err) {
      if (currentId === requestId.current) {
        setError(err as Error);
      }
    } finally {
      if (currentId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);


  // Build effective params: non-text fields are immediate, text fields are debounced
  useEffect(() => {
    const effectiveParams = {
      ...filters,
      search: debouncedSearch,
      plate: debouncedPlate,
      brand: debouncedBrand,
      model: debouncedModel,
      color: debouncedColor,
    };
    fetchVehicles(effectiveParams);
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.companyId,
    debouncedSearch,
    debouncedPlate,
    debouncedBrand,
    debouncedModel,
    debouncedColor,
    fetchVehicles,
  ]);

  const setFilters = useCallback((newFilters: Partial<VehicleFilterParams>) => {
    setFiltersRaw((prev) => {
      const isOnlyPageChange =
        "page" in newFilters && Object.keys(newFilters).length === 1;
      return {
        ...prev,
        ...newFilters,
        ...(isOnlyPageChange ? {} : { page: 1 }),
      };
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersRaw((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchVehicles(filters);
  }, [filters, fetchVehicles]);

  const clearFilters = useCallback(() => {
    setFiltersRaw({ page: 1, limit: initialFilters.limit || 20, status: "active" });
  }, [initialFilters.limit]);

  return { data, meta, isLoading, error, filters, setFilters, setPage, refresh, clearFilters };
}
