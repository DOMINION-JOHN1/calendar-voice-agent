import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Voice Scheduling Agent | AI-Powered Calendar Assistant",
    description:
        "Schedule meetings effortlessly using voice commands. Powered by VAPI, ElevenLabs, and Google Calendar.",
    keywords: ["voice assistant", "scheduling", "AI", "calendar", "meeting"],
    openGraph: {
        title: "Voice Scheduling Agent",
        description: "Schedule meetings effortlessly using voice commands.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body>{children}</body>
        </html>
    );
}
