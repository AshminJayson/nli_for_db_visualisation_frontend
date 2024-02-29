import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const ibm_mono = IBM_Plex_Mono({
    weight: ["100", "200", "300", "400", "500", "600", "700"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "NLI for DB Visualization",
    description: "Tool to query and visualize databases using natural language",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={ibm_mono.className}>{children}</body>
        </html>
    );
}
