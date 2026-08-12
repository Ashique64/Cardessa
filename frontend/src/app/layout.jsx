import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Cardessa — Digital Wedding Invitations",
  description:
    "Create stunning, animated digital wedding invitations. Share as a live link. Edit anytime until your event.",
  openGraph: {
    title: "Cardessa — Digital Wedding Invitations",
    description: "Create stunning, animated digital wedding invitations.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
