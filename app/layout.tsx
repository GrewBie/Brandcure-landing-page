import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { ScrollProgress } from "@/components/ui/LazyScrollProgress";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { LazyChatWidget } from "@/components/chat/LazyChatWidget";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { SchemaHead } from "@/components/seo/SchemaHead";
import { globalSchemaGraph } from "@/lib/seo/schema";
import { rootMetadata } from "@/lib/seo/metadata";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

export const metadata = rootMetadata;

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${dmSans.variable} h-full transition-colors duration-700 ease-in-out`}
      suppressHydrationWarning
    >
      <head>
        <SchemaHead data={globalSchemaGraph()} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <SiteAnalytics />
        <ClientProviders>
          <ScrollProgress />
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <LazyChatWidget />
        </ClientProviders>
      </body>
    </html>
  );
}
