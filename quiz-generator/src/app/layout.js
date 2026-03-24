import "@/styles/globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Quiz Generator",
  description: "Generate AI-powered quizzes on any topic",
  icons: { icon: ['/favicon.ico'] },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
