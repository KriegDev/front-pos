import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";

export const metadata = {
  title: {
    default: "El Rincón de la Tía Ceci",
    template: "%s | El Rincón de la Tía Ceci",
  },
  description:
    "Minimarket de barrio en Maipú. Compra abarrotes, bebidas, limpieza, lácteos y frutas y verduras en línea.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-vh-100 d-flex flex-column">
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
