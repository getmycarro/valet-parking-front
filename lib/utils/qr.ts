// /**
//  * QR Code utilities
//  * Handles QR code generation and printing
//  * QR deshabilitado - todo el archivo comentado
//  */
//
// /**
//  * QR code data structure for valet tickets
//  */
// export interface QRCodeData {
//   type: "valet_ticket";
//   v: number;
//   carId: string;
//   plate: string;
//   checkInAt: number;
// }
//
// /**
//  * Generate QR code data for a valet ticket
//  */
// export function generateQRCodeData(
//   carId: string,
//   plate: string,
//   checkInAt: number
// ): string {
//   const data: QRCodeData = {
//     type: "valet_ticket",
//     v: 1,
//     carId,
//     plate,
//     checkInAt,
//   };
//   return JSON.stringify(data);
// }
//
// /**
//  * Parse QR code data from a scanned string
//  */
// export function parseQRCodeData(qrData: string): QRCodeData | null {
//   try {
//     const data = JSON.parse(qrData);
//     if (data.type === "valet_ticket" && data.v === 1) {
//       return data as QRCodeData;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// }
//
// /**
//  * Print QR code to a new window
//  */
// export function printQRCode(
//   qrCodeUrl: string,
//   plate: string,
//   ticketNumber: string,
//   checkInTime: string
// ): void {
//   const printWindow = window.open("", "_blank");
//   if (!printWindow) {
//     alert("Please allow pop-ups to print the QR code");
//     return;
//   }
//
//   printWindow.document.write(`
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <title>Valet Ticket - ${plate}</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             min-height: 100vh;
//             margin: 0;
//             padding: 20px;
//           }
//           .ticket {
//             text-align: center;
//             border: 2px solid #000;
//             padding: 20px;
//             max-width: 400px;
//           }
//           .ticket h1 {
//             margin: 0 0 10px 0;
//             font-size: 24px;
//           }
//           .ticket img {
//             margin: 20px 0;
//             max-width: 100%;
//           }
//           .ticket .info {
//             margin: 10px 0;
//             font-size: 18px;
//           }
//           .ticket .label {
//             font-weight: bold;
//           }
//           @media print {
//             body {
//               display: block;
//             }
//             .ticket {
//               border: 2px solid #000;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="ticket">
//           <h1>Valet Parking Ticket</h1>
//           <img src="${qrCodeUrl}" alt="QR Code" />
//           <div class="info">
//             <span class="label">Ticket #:</span> ${ticketNumber}
//           </div>
//           <div class="info">
//             <span class="label">Plate:</span> ${plate}
//           </div>
//           <div class="info">
//             <span class="label">Check-in:</span> ${checkInTime}
//           </div>
//         </div>
//       </body>
//     </html>
//   `);
//
//   printWindow.document.close();
//   printWindow.focus();
//
//   // Wait for image to load before printing
//   const img = printWindow.document.querySelector("img");
//   if (img) {
//     img.onload = () => {
//       setTimeout(() => {
//         printWindow.print();
//         printWindow.close();
//       }, 250);
//     };
//   } else {
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 250);
//   }
// }
