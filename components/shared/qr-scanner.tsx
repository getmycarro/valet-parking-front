// QR deshabilitado - todo el componente comentado
//
// "use client";
//
// import { useEffect, useRef, useState } from "react";
// import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
// import { Button } from "@/components/ui/button";
// import { Camera, Upload, X } from "lucide-react";
//
// type Props = {
//   onScan: (data: string) => void;
//   onError?: (error: string) => void;
// };
//
// export function QRScanner({ onScan, onError }: Props) {
//   const scannerRef = useRef<Html5QrcodeScanner | null>(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [scanMode, setScanMode] = useState<"camera" | "file">("camera");
//
//   useEffect(() => {
//     if (!isScanning) return;
//
//     const scannerId = "qr-scanner-container";
//
//     if (scannerRef.current) {
//       scannerRef.current.clear().catch(console.error);
//     }
//
//     const scanner = new Html5QrcodeScanner(
//       scannerId,
//       {
//         fps: 10,
//         qrbox: { width: 250, height: 250 },
//         supportedScanTypes: [
//           scanMode === "camera"
//             ? Html5QrcodeScanType.SCAN_TYPE_CAMERA
//             : Html5QrcodeScanType.SCAN_TYPE_FILE
//         ],
//         showTorchButtonIfSupported: true,
//         showZoomSliderIfSupported: true,
//       },
//       false
//     );
//
//     scannerRef.current = scanner;
//
//     scanner.render(
//       (decodedText) => {
//         onScan(decodedText);
//         scanner.clear().catch(console.error);
//         setIsScanning(false);
//       },
//       (errorMessage) => {
//         if (!errorMessage.includes("NotFoundException")) {
//           onError?.(errorMessage);
//         }
//       }
//     );
//
//     return () => {
//       if (scannerRef.current) {
//         scannerRef.current.clear().catch(console.error);
//       }
//     };
//   }, [isScanning, scanMode, onScan, onError]);
//
//   if (isScanning) {
//     return (
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Escanear código QR</h3>
//           <Button variant="ghost" size="sm" onClick={() => { setIsScanning(false); scannerRef.current?.clear().catch(console.error); }}>
//             <X className="w-4 h-4 mr-2" /> Cancelar
//           </Button>
//         </div>
//         <div className="flex gap-2 mb-4">
//           <Button variant={scanMode === "camera" ? "default" : "outline"} size="sm" onClick={() => setScanMode("camera")}>
//             <Camera className="w-4 h-4 mr-2" /> Cámara
//           </Button>
//           <Button variant={scanMode === "file" ? "default" : "outline"} size="sm" onClick={() => setScanMode("file")}>
//             <Upload className="w-4 h-4 mr-2" /> Archivo
//           </Button>
//         </div>
//         <div id="qr-scanner-container" className="w-full rounded-lg overflow-hidden border border-border" />
//       </div>
//     );
//   }
//
//   return (
//     <div className="space-y-4">
//       <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
//         <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
//         <p className="text-sm text-muted-foreground mb-4">
//           Escanea un código QR para registrar el vehículo automáticamente
//         </p>
//         <Button onClick={() => setIsScanning(true)}>
//           <Camera className="w-4 h-4 mr-2" /> Iniciar escáner
//         </Button>
//       </div>
//     </div>
//   );
// }
