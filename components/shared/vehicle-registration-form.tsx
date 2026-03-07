"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { QRScanner } from "@/components/shared/qr-scanner"; // QR deshabilitado
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { isValidEmail, isValidPhone, isValidPlate } from "@/lib/utils/validation";
import { IdCard, FileText, Search, ArrowLeft, Plus, Car } from "lucide-react"; // QrCode removido - QR deshabilitado
import { toast } from "sonner";
import { vehiclesService, type UserWithVehicles, type ValetInfo } from "@/lib/services/vehicles-service";
import { companiesService, type Company } from "@/lib/services/companies-service";

type Props = {
  onSubmitted?: () => void;
};

export function VehicleRegistrationForm({ onSubmitted }: Props) {
  const { registerCarManual } = useStore(); // registerCarQR removido - QR deshabilitado
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Companies list (only for admin roles)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  useEffect(() => {
    if (isAdmin) {
      companiesService.getAll({ isActive: true, limit: 100 })
        .then((res) => setCompanies(res.data))
        .catch((err) => console.error("[companies] failed to load:", err));
    }
  }, [isAdmin]);

  // Manual form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  // Valet list
  const [valets, setValets] = useState<ValetInfo[]>([]);
  const [selectedValetId, setSelectedValetId] = useState("");
  useEffect(() => {
    vehiclesService.getValets().then(setValets).catch(() => {});
  }, []);

  // Cedula tab state
  const [idNumber, setIdNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResult, setSearchResult] = useState<UserWithVehicles | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [wizardStep, setWizardStep] = useState<"search" | "results">("search");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [addingNewVehicle, setAddingNewVehicle] = useState(false);

  // Cedula tab - new vehicle fields
  const [cedulaPlate, setCedulaPlate] = useState("");
  const [cedulaBrand, setCedulaBrand] = useState("");
  const [cedulaModel, setCedulaModel] = useState("");
  const [cedulaColor, setCedulaColor] = useState("");

  // Cedula tab - new user fields
  const [cedulaName, setCedulaName] = useState("");
  const [cedulaEmail, setCedulaEmail] = useState("");
  const [cedulaError, setCedulaError] = useState("");

  // --- Manual tab handlers ---

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isAdmin && !selectedCompanyId) {
      setError("Debes seleccionar una empresa");
      return;
    }

    if (!plate.trim()) {
      setError("Por favor ingresa la placa");
      return;
    }

    if (!isValidPlate(plate)) {
      setError("Formato de placa inválido");
      return;
    }

    if (email && !isValidEmail(email)) {
      setError("Formato de email inválido");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setError("Formato de teléfono inválido");
      return;
    }

    try {
      await registerCarManual({
        plate,
        brand: brand || undefined,
        model: model || undefined,
        color: color || undefined,
        email: email || undefined,
        name: name || undefined,
        valedId: selectedValetId || undefined,
        companyId: selectedCompanyId || undefined,
      });

      setName("");
      setPhone("");
      setEmail("");
      setBrand("");
      setPlate("");
      setModel("");
      setColor("");
      setError("");
      setSelectedValetId("");
      setSelectedCompanyId("");

      toast.success("Vehículo registrado exitosamente");
      onSubmitted?.();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Error al registrar vehículo";
      setError(message);
    }
  };

  // --- QR tab handlers --- (QR deshabilitado)
  // const handleQRScan = (qrData: string) => {
  //   try {
  //     registerCarQR(qrData);
  //     toast.success("Vehículo registrado desde QR exitosamente");
  //     onSubmitted?.();
  //   } catch (err) {
  //     toast.error("Error al procesar el código QR");
  //     console.error(err);
  //   }
  // };

  // const handleQRError = (errorMessage: string) => {
  //   toast.error(`Error en el escáner: ${errorMessage}`);
  // };

  // --- Cedula tab handlers ---

  const resetCedulaForm = () => {
    setIdNumber("");
    setSearchResult(null);
    setUserNotFound(false);
    setWizardStep("search");
    setSelectedVehicleId(null);
    setAddingNewVehicle(false);
    setCedulaPlate("");
    setCedulaBrand("");
    setCedulaModel("");
    setCedulaColor("");
    setCedulaName("");
    setCedulaEmail("");
    setCedulaError("");
    setSelectedValetId("");
    setSelectedCompanyId("");
  };

  const handleIdSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCedulaError("");

    if (!idNumber.trim()) {
      toast.error("Por favor ingresa un número de cédula");
      return;
    }

    setIsSearching(true);

    try {
      const result = await vehiclesService.getUserVehicles(idNumber.trim());
      if (result?.id) {
        setSearchResult(result);
        setUserNotFound(false);
        if (result.ownedVehicles.length === 0) {
          setAddingNewVehicle(true);
        } else if (result.ownedVehicles.length === 1) {
          setSelectedVehicleId(result.ownedVehicles[0].id);
        }
      } else {
        setSearchResult(null);
        setUserNotFound(true);
      }
      setWizardStep("results");
    } catch {
      setSearchResult(null);
      setUserNotFound(true);
      setWizardStep("results");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCedulaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCedulaError("");

    if (isAdmin && !selectedCompanyId) {
      setCedulaError("Debes seleccionar una empresa");
      return;
    }

    setIsSubmitting(true);

    try {
      if (searchResult && !userNotFound) {
        // Usuario existente
        if (selectedVehicleId) {
          const vehicle = searchResult.ownedVehicles.find((v) => v.id === selectedVehicleId);
          if (!vehicle) {
            setCedulaError("Vehículo no encontrado");
            return;
          }
          await registerCarManual({
            userId: searchResult.id,
            vehicleId: selectedVehicleId,
            plate: vehicle.plate,
            brand: vehicle.brand,
            model: vehicle.model,
            color: vehicle.color,
            valedId: selectedValetId || undefined,
            companyId: selectedCompanyId || undefined,
          });
        } else if (addingNewVehicle) {
          if (!cedulaPlate.trim()) {
            setCedulaError("La placa es requerida");
            return;
          }
          if (!isValidPlate(cedulaPlate)) {
            setCedulaError("Formato de placa inválido");
            return;
          }
          await registerCarManual({
            userId: searchResult.id,
            plate: cedulaPlate,
            brand: cedulaBrand || undefined,
            model: cedulaModel || undefined,
            color: cedulaColor || undefined,
            valedId: selectedValetId || undefined,
            companyId: selectedCompanyId || undefined,
          });
        } else {
          setCedulaError("Selecciona un vehículo o agrega uno nuevo");
          return;
        }
      } else {
        // Usuario nuevo
        if (!cedulaEmail.trim()) {
          setCedulaError("El email es requerido para nuevos usuarios");
          return;
        }
        if (!isValidEmail(cedulaEmail)) {
          setCedulaError("Formato de email inválido");
          return;
        }
        if (!cedulaPlate.trim()) {
          setCedulaError("La placa es requerida");
          return;
        }
        if (!isValidPlate(cedulaPlate)) {
          setCedulaError("Formato de placa inválido");
          return;
        }
        await registerCarManual({
          idNumber: idNumber.trim(),
          email: cedulaEmail.trim(),
          name: cedulaName.trim() || undefined,
          plate: cedulaPlate,
          brand: cedulaBrand || undefined,
          model: cedulaModel || undefined,
          color: cedulaColor || undefined,
          valedId: selectedValetId || undefined,
          companyId: selectedCompanyId || undefined,
        });
      }

      toast.success("Vehículo registrado exitosamente");
      resetCedulaForm();
      onSubmitted?.();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Error al registrar vehículo";
      setCedulaError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  return (
    <Tabs defaultValue="id" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        {/* QR tab deshabilitado */}
        {/* <TabsTrigger value="qr">
          <QrCode className="w-4 h-4 mr-2" />
          Escanear QR
        </TabsTrigger> */}
        <TabsTrigger value="id" onClick={() => { if (wizardStep !== "search") resetCedulaForm(); }}>
          <IdCard className="w-4 h-4 mr-2" />
          Por Cédula
        </TabsTrigger>
        <TabsTrigger value="manual">
          <FileText className="w-4 h-4 mr-2" />
          Manual
        </TabsTrigger>
      </TabsList>

      {/* ===== QR Tab ===== (QR deshabilitado) */}
      {/* <TabsContent value="qr" className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Escanea el código QR del ticket del vehículo para registrarlo automáticamente.
        </div>
        <QRScanner onScan={handleQRScan} onError={handleQRError} />
      </TabsContent> */}

      {/* ===== Cedula Tab ===== */}
      <TabsContent value="id" className="space-y-4">
        {wizardStep === "search" && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Ingresa el número de cédula del propietario para buscar sus vehículos registrados.
            </div>
            <form onSubmit={handleIdSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">Número de Cédula</Label>
                <div className="flex gap-2">
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="V-12345678 o E-12345678"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSearching}>
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}

        {wizardStep === "results" && searchResult && !userNotFound && (
          <form onSubmit={handleCedulaSubmit} className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetCedulaForm}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a buscar
            </Button>

            {/* User info banner */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium">
                {searchResult.name || "Sin nombre"} &mdash; {searchResult.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Cédula: {searchResult.idNumber || idNumber}
              </p>
            </div>

            {cedulaError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {cedulaError}
              </div>
            )}

            {/* Vehicle list */}
            {searchResult.ownedVehicles.length > 0 && (
              <div className="space-y-2">
                <Label>Vehículos registrados</Label>
                <div className="space-y-2">
                  {searchResult.ownedVehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId(v.id);
                        setAddingNewVehicle(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full text-left ${
                        selectedVehicleId === v.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Car className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-medium tracking-widest">{v.plate}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[v.brand, v.model, v.color].filter(Boolean).join(" - ") || "Sin detalles"}
                        </p>
                      </div>
                      {selectedVehicleId === v.id && (
                        <span className="text-xs text-primary font-medium">Seleccionado</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add new vehicle toggle */}
            {!addingNewVehicle && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddingNewVehicle(true);
                  setSelectedVehicleId(null);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar nuevo vehículo
              </Button>
            )}

            {/* New vehicle form */}
            {addingNewVehicle && (
              <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Nuevo vehículo</Label>
                  {searchResult.ownedVehicles.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingNewVehicle(false)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cedulaPlate">Placa *</Label>
                    <Input
                      id="cedulaPlate"
                      value={cedulaPlate}
                      onChange={(e) => setCedulaPlate(e.target.value.toUpperCase())}
                      className="uppercase tracking-widest"
                      placeholder="ABC123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cedulaBrand">Marca</Label>
                    <Input
                      id="cedulaBrand"
                      value={cedulaBrand}
                      onChange={(e) => setCedulaBrand(e.target.value)}
                      placeholder="Toyota, Ford, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cedulaModel">Modelo</Label>
                    <Input
                      id="cedulaModel"
                      value={cedulaModel}
                      onChange={(e) => setCedulaModel(e.target.value)}
                      placeholder="Modelo del vehículo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cedulaColor">Color</Label>
                    <Input
                      id="cedulaColor"
                      value={cedulaColor}
                      onChange={(e) => setCedulaColor(e.target.value)}
                      placeholder="Color del vehículo"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Empresa */}
            {isAdmin && (
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona una empresa --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Valet de ingreso */}
            <div className="space-y-2">
              <Label>Valet de ingreso</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedValetId}
                onChange={(e) => setSelectedValetId(e.target.value)}
              >
                <option value="">-- Sin valet --</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.idNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isSubmitting || (!selectedVehicleId && !addingNewVehicle)}
              >
                {isSubmitting ? "Registrando..." : "Registrar Check-In"}
              </Button>
            </div>
          </form>
        )}

        {wizardStep === "results" && userNotFound && (
          <form onSubmit={handleCedulaSubmit} className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetCedulaForm}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a buscar
            </Button>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No se encontró un usuario con la cédula <strong>{idNumber}</strong>.
                Ingresa los datos para registrarlo.
              </p>
            </div>

            {cedulaError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {cedulaError}
              </div>
            )}

            {/* New user info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedulaName">Nombre completo</Label>
                <Input
                  id="cedulaName"
                  value={cedulaName}
                  onChange={(e) => setCedulaName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedulaEmail">Email *</Label>
                <Input
                  id="cedulaEmail"
                  type="email"
                  value={cedulaEmail}
                  onChange={(e) => setCedulaEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cédula</Label>
              <Input value={idNumber} disabled className="bg-muted" />
            </div>

            {/* New vehicle info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newUserPlate">Placa *</Label>
                <Input
                  id="newUserPlate"
                  value={cedulaPlate}
                  onChange={(e) => setCedulaPlate(e.target.value.toUpperCase())}
                  className="uppercase tracking-widest"
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserBrand">Marca</Label>
                <Input
                  id="newUserBrand"
                  value={cedulaBrand}
                  onChange={(e) => setCedulaBrand(e.target.value)}
                  placeholder="Toyota, Ford, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newUserModel">Modelo</Label>
                <Input
                  id="newUserModel"
                  value={cedulaModel}
                  onChange={(e) => setCedulaModel(e.target.value)}
                  placeholder="Modelo del vehículo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserColor">Color</Label>
                <Input
                  id="newUserColor"
                  value={cedulaColor}
                  onChange={(e) => setCedulaColor(e.target.value)}
                  placeholder="Color del vehículo"
                />
              </div>
            </div>

            {/* Empresa */}
            {isAdmin && (
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona una empresa --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Valet de ingreso */}
            <div className="space-y-2">
              <Label>Valet de ingreso</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedValetId}
                onChange={(e) => setSelectedValetId(e.target.value)}
              >
                <option value="">-- Sin valet --</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.idNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Check-In"}
              </Button>
            </div>
          </form>
        )}
      </TabsContent>

      {/* ===== Manual Tab ===== */}
      <TabsContent value="manual" className="space-y-4">
        <form className="space-y-4" onSubmit={handleManualSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Número de contacto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota, Ford, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa *</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="uppercase tracking-widest"
                placeholder="ABC123"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Modelo del vehículo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color (opcional)</Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Color del vehículo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valetManual">Valet de ingreso</Label>
              <select
                id="valetManual"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedValetId}
                onChange={(e) => setSelectedValetId(e.target.value)}
              >
                <option value="">-- Sin valet --</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.idNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="companyManual">Empresa *</Label>
              <select
                id="companyManual"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                required
              >
                <option value="">-- Selecciona una empresa --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full md:w-auto">
              Registrar
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
