import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata = {
  title: "AI Product Research & CRO Lab",
  description: "17-section interactive AI research workflow for building high-converting landing pages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}