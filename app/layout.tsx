import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat, Pinyon_Script } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Dar Lalla — Location de caftans, takchitas et djellabas",
    template: "%s | Dar Lalla",
  },
  description:
    "Dar Lalla, location de caftans, takchitas et djellabas à Casablanca pour vos mariages, fiançailles, henné et soirées. Réservation en ligne, retouches et pressing inclus.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Dar Lalla",
  },
};

export const viewport: Viewport = {
  themeColor: "#2A0B28",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
