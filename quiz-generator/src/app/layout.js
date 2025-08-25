import "@/styles/globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Quiz Generator",
  description: "Making by heart by Ritoche1",
  icons: {
    icon: [
      '/favicon.ico'
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
