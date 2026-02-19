"use client";

/**
 * VoiceAgent Component
 * The main voice interaction UI featuring:
 * - Animated orb that pulses when AI is speaking
 * - Audio waveform visualization
 * - Call controls
 * - Status indicator
 */

import { useEffect, useRef } from "react";
import type { CallStatus, TranscriptEntry } from "@/hooks/useVapi";

interface VoiceAgentProps {
    status: CallStatus;
    isSpeaking: boolean;
    volumeLevel: number;
    transcript: TranscriptEntry[];
    onStart: () => void;
    onEnd: () => void;
}

// Microphone SVG icon
function MicIcon() {
    return (
        <svg
            className="orb__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    );
}

// Phone off SVG icon
function PhoneOffIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
        </svg>
    );
}

// Waveform bars
function WaveformBars({ volumeLevel }: { volumeLevel: number }) {
    const barCount = 12;
    const bars = Array.from({ length: barCount }, (_, i) => {
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
        const baseHeight = 6;
        const maxAdditionalHeight = 40;
        const height =
            baseHeight +
            maxAdditionalHeight *
            volumeLevel *
            (1 - centerDistance * 0.6) *
            (0.7 + Math.random() * 0.3);
        return height;
    });

    return (
        <div className="waveform">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="waveform__bar"
                    style={{
                        height: `${h}px`,
                        opacity: 0.4 + volumeLevel * 0.6,
                    }}
                />
            ))}
        </div>
    );
}

export default function VoiceAgent({
    status,
    isSpeaking,
    volumeLevel,
    transcript,
    onStart,
    onEnd,
}: VoiceAgentProps) {
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    const statusText = {
        idle: "Ready to schedule",
        connecting: "Connecting...",
        active: isSpeaking ? "AI is speaking..." : "Listening...",
    };

    const statusDotClass = {
        idle: "",
        connecting: "status__dot--connecting",
        active: isSpeaking ? "status__dot--speaking" : "status__dot--listening",
    };

    return (
        <>
            {/* Status Badge */}
            <div className="status">
                <span className={`status__dot ${statusDotClass[status]}`} />
                <span>{statusText[status]}</span>
            </div>

            {/* Voice Orb */}
            <div className="orb-container">
                <div
                    className={`orb ${status === "active" ? "orb--active" : ""}`}
                    onClick={status === "idle" ? onStart : undefined}
                    role="button"
                    tabIndex={0}
                    aria-label={status === "idle" ? "Start voice call" : "Voice call active"}
                >
                    <div className="orb__rings" />
                    <div className="orb__rings" />
                    <div className="orb__rings" />
                    {status === "active" && volumeLevel > 0.05 ? (
                        <WaveformBars volumeLevel={volumeLevel} />
                    ) : (
                        <MicIcon />
                    )}
                </div>
            </div>

            {/* Call Controls */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
                {status === "idle" ? (
                    <button className="call-btn call-btn--start" onClick={onStart}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="9" y="2" width="6" height="12" rx="3" />
                            <path d="M5 10a7 7 0 0 0 14 0" />
                        </svg>
                        Start Conversation
                    </button>
                ) : status === "connecting" ? (
                    <button className="call-btn call-btn--start" disabled>
                        <span
                            style={{
                                width: 16,
                                height: 16,
                                border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "orb-rotate 0.8s linear infinite",
                            }}
                        />
                        Connecting...
                    </button>
                ) : (
                    <button className="call-btn call-btn--end" onClick={onEnd}>
                        <PhoneOffIcon />
                        End Call
                    </button>
                )}
            </div>

            {/* Transcript Panel */}
            {(status === "active" || transcript.length > 0) && (
                <div className="transcript">
                    <div className="transcript__header">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Conversation
                    </div>
                    <div className="transcript__body">
                        {transcript.length === 0 ? (
                            <p className="transcript__empty">
                                Listening for conversation...
                            </p>
                        ) : (
                            transcript.map((entry, i) => (
                                <div key={i} className="transcript__message">
                                    <div
                                        className={`transcript__role transcript__role--${entry.role}`}
                                    >
                                        {entry.role === "assistant" ? "🤖 Assistant" : "👤 You"}
                                    </div>
                                    <div className="transcript__text">{entry.text}</div>
                                </div>
                            ))
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>
            )}
        </>
    );
}
