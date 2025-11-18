import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "../providers/theme-provider";
import Footer from "@/components/footer/footer";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Attenda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-screen flex flex-col">
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <div className="fixed bottom-0 left-0 w-full z-50">
              <Footer />
            </div>
          </ThemeProvider>
      </body>
    </html>
  );
}
