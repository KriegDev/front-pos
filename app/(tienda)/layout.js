import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TiendaLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </>
  );
}
