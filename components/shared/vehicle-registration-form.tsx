"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

type Props = {
  onSubmitted?: () => void;
};

export function VehicleRegistrationForm({ onSubmitted }: Props) {
  const { registrarAutoManual } = useStore();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [marca, setMarca] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!placa) return;
        registrarAutoManual({
          nombre,
          telefono,
          correo,
          marca,
          placa,
          modelo,
          color,
        });
        setNombre("");
        setTelefono("");
        setCorreo("");
        setMarca("");
        setPlaca("");
        setModelo("");
        setColor("");
        onSubmitted?.();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del titular"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Número de contacto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="cliente@correo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Toyota, Ford, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa</Label>
          <Input
            id="placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            className="uppercase tracking-widest"
            placeholder="ABC123"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="Modelo del vehículo"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Color del vehículo"
          />
        </div>
        <div />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full md:w-auto">
          Registrar vehículo
        </Button>
      </div>
    </form>
  );
}
