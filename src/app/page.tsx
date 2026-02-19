"use client";

/**
 * Voice Scheduling Agent — Main Page
 * Landing page with the voice agent interface.
 */

import VoiceAgent from "@/components/VoiceAgent";
import EventCard from "@/components/EventCard";
import { useVapi } from "@/hooks/useVapi";

export default function Home() {
    const {
        status,
        isSpeaking,
        transcript,
        volumeLevel,
        createdEvent,
        startCall,
        endCall,
    } = useVapi();

    return (
        <>
            {/* Background Effects */}
            <div className="bg-grid" />
            <div className="bg-glow bg-glow--purple" />
            <div className="bg-glow bg-glow--blue" />

            <main className="page">
                {/* Header */}
                <header className="header">
                    <div className="header__badge">
                        <span className="header__badge-dot" />
                        AI-Powered Scheduling
                    </div>
                    <h1 className="header__title">Voice Scheduling Agent</h1>
                    <p className="header__subtitle">
                        Click the microphone and tell me when you&apos;d like to schedule a
                        meeting. I&apos;ll handle the rest.
                    </p>
                </header>

                {/* Voice Agent */}
                <VoiceAgent
                    status={status}
                    isSpeaking={isSpeaking}
                    volumeLevel={volumeLevel}
                    transcript={transcript}
                    onStart={startCall}
                    onEnd={endCall}
                />

                {/* Event Confirmation Card */}
                {createdEvent && (
                    <EventCard
                        summary={createdEvent.summary}
                        date={createdEvent.date}
                        startTime={createdEvent.startTime}
                        endTime={createdEvent.endTime}
                        link={createdEvent.link}
                    />
                )}

                {/* Footer */}
                <footer className="footer">
                    <p>
                        Powered by{" "}
                        <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer">
                            VAPI
                        </a>{" "}
                        ·{" "}
                        <a
                            href="https://elevenlabs.io"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ElevenLabs
                        </a>{" "}
                        ·{" "}
                        <a
                            href="https://calendar.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google Calendar
                        </a>
                    </p>
                </footer>
            </main>
        </>
    );
}
