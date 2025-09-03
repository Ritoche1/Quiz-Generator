import "@/styles/globals.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata = {
  title: "Quiz Generator",
  description: "Making by heart by Ritoche1",
  icons: {
    icon: [
      '/favicon.ico'
    ],
  },
};

// Use Next.js App Router viewport API instead of a manual <meta> tag
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <CartProvider>
            <AppShell>
              {children}
            </AppShell>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
