"use client";

import type React from "react";
import { useRef, useState } from "react";
import { User, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Employee } from "@/lib/types";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminEncargadosPage() {
  const { state, addEmpleado, removeEmpleado } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(undefined);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre || !cedula) return;
    addEmpleado({ nombre, cedula, fotoUrl });
    setNombre("");
    setCedula("");
    setFotoUrl(undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setFotoUrl(String(r.result));
    r.readAsDataURL(f);
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v: boolean) => !v)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Encargados</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona el equipo de valet
              </p>
            </div>
          </div>
        </header>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Registrar encargado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-muted-foreground">
                      Nombre
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="pl-9"
                        placeholder="Nombre completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cedula" className="text-muted-foreground">
                      Cédula
                    </Label>
                    <Input
                      id="cedula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Número de documento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto" className="text-muted-foreground">
                      Foto
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="foto"
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={onFile}
                        className="file:bg-accent file:text-accent-foreground file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 cursor-pointer"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Guardar encargado
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Lista de encargados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Foto</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Cédula</th>
                        <th className="px-4 py-3 rounded-tr-lg text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {state.empleados.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No hay encargados registrados
                          </td>
                        </tr>
                      ) : (
                        state.empleados.map((e: Employee) => (
                          <tr
                            key={e.id}
                            className="hover:bg-accent/30 transition-colors odd:bg-muted/20"
                          >
                            <td className="px-4 py-3">
                              {e.fotoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={e.fotoUrl}
                                  alt={e.nombre}
                                  className="w-10 h-10 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                  <User className="h-5 w-5" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {e.nombre}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {e.cedula}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEmpleado(e.id)}
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
