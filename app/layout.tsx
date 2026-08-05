import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SiteDataProvider } from "@/context/SiteDataContext";
import RatingPopup from "@/components/RatingPopup";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PIXORA",
  description: "Graphic Design | Branding | Advertising",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <SiteDataProvider>
            {children}
            <RatingPopup />
          </SiteDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}