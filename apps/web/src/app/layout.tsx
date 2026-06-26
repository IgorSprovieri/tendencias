import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AppToaster } from "@/components/app-toaster";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Área Logada | Tendências Consultoria",
  description: "Acesse a área logada da Tendências Consultoria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
