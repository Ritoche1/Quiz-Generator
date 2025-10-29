import "@/styles/globals.css";
import AppShell from "@/components/AppShell";

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
      <body className="antialiased min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
