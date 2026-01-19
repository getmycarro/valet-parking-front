"use client";

import type React from "react";
import { useState } from "react";
import { Car as CarIcon } from "lucide-react";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function RegistrarVehiculoPage() {
  const { registrarAutoManual } = useStore();
  const { user } = useAuth();
  const pathname = usePathname();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [marca, setMarca] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    setMsg("Auto registrado");
    setTimeout(() => setMsg(""), 1500);
  }

  const navigation = (
    <>
      <Link
        href="/encargado/dashboard"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          pathname === "/encargado/dashboard" &&
            "bg-accent text-accent-foreground"
        )}
      >
        <CarIcon className="w-4 h-4" />
        <span>Panel</span>
      </Link>
      <Link
        href="/encargado/registrar"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          pathname === "/encargado/registrar" &&
            "bg-accent text-accent-foreground"
        )}
      >
        <CarIcon className="w-4 h-4" />
        <span>Registrar vehículo</span>
      </Link>
    </>
  );

  return (
    <SidebarLayout
      navigation={navigation}
      userInfo={{
        name: user?.nombre || "Encargado",
        role: "Encargado",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span className="flex items-center gap-2">
                <CarIcon className="h-5 w-5" />
                Registro manual
              </span>
              {msg ? (
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {msg}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-muted-foreground">
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del titular"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-muted-foreground">
                    Teléfono
                  </Label>
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
                  <Label htmlFor="correo" className="text-muted-foreground">
                    Correo
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="cliente@correo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca" className="text-muted-foreground">
                    Marca
                  </Label>
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
                  <Label htmlFor="placa" className="text-muted-foreground">
                    Placa
                  </Label>
                  <Input
                    id="placa"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="uppercase tracking-widest"
                    placeholder="ABC123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo" className="text-muted-foreground">
                    Modelo
                  </Label>
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
                  <Label htmlFor="color" className="text-muted-foreground">
                    Color
                  </Label>
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
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
