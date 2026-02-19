"use client";

/**
 * useVapi — Custom React hook for the VAPI Web SDK
 *
 * Manages the lifecycle of a voice call:
 * - start/stop calls
 * - track call status (idle, connecting, active)
 * - track speaking state
 * - accumulate conversation transcript
 * - capture created event details from tool results
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { buildAssistantConfig } from "@/lib/assistant";

export type CallStatus = "idle" | "connecting" | "active";

export interface TranscriptEntry {
    role: "assistant" | "user";
    text: string;
    timestamp: number;
}

export interface CreatedEvent {
    summary: string;
    date: string;
    startTime: string;
    endTime: string;
    link?: string;
}

export function useVapi() {
    const vapiRef = useRef<Vapi | null>(null);
    const [status, setStatus] = useState<CallStatus>("idle");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null);

    // Initialize VAPI instance once
    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!publicKey) {
            console.error("VAPI public key not found in environment variables");
            return;
        }

        const vapi = new Vapi(publicKey);
        vapiRef.current = vapi;

        // ─── Event Listeners ───
        vapi.on("call-start", () => {
            console.log("📞 Call started");
            setStatus("active");
        });

        vapi.on("call-end", () => {
            console.log("📞 Call ended");
            setStatus("idle");
            setIsSpeaking(false);
            setVolumeLevel(0);
        });

        vapi.on("speech-start", () => {
            setIsSpeaking(true);
        });

        vapi.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapi.on("volume-level", (level: number) => {
            setVolumeLevel(level);
        });

        vapi.on("message", (msg: Record<string, unknown>) => {
            // Capture conversation messages for transcript
            if (msg.type === "conversation-update") {
                const conversation = msg.conversation as Array<{
                    role: string;
                    content: string;
                }>;
                if (conversation && conversation.length > 0) {
                    const entries: TranscriptEntry[] = conversation
                        .filter(
                            (m) =>
                                (m.role === "assistant" || m.role === "user") && m.content
                        )
                        .map((m) => ({
                            role: m.role as "assistant" | "user",
                            text: m.content,
                            timestamp: Date.now(),
                        }));
                    setTranscript(entries);
                }
            }

            // Capture transcript (real-time partial)
            if (msg.type === "transcript") {
                const role = msg.role as string;
                const text = msg.transcript as string;
                const transcriptType = msg.transcriptType as string;

                if (transcriptType === "final" && text && (role === "assistant" || role === "user")) {
                    setTranscript((prev) => {
                        // Avoid duplicates
                        const last = prev[prev.length - 1];
                        if (last && last.role === role && last.text === text) return prev;
                        return [...prev, { role: role as "assistant" | "user", text, timestamp: Date.now() }];
                    });
                }
            }

            // Capture tool call results for event card
            if (msg.type === "tool-calls-result" || msg.type === "function-call-result") {
                console.log("🔧 Tool result:", JSON.stringify(msg));
            }
        });

        vapi.on("error", (error: any) => {
            console.error("Vapi Error Object:", error);
            // Some errors are objects with hidden properties, let's try to force reveal them
            const detailedError = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
            console.error("Detailed Vapi Error:", detailedError);
            setStatus("idle");
        });

        return () => {
            vapi.stop();
        };
    }, []);

    // Start a call with the assistant config
    const startCall = useCallback(async () => {
        if (!vapiRef.current) return;

        setStatus("connecting");
        setTranscript([]);
        setCreatedEvent(null);

        try {
            // Always use the current page origin as the webhook URL.
            // On Vercel this will be the real production domain.
            // On localhost this will be localhost (webhook won't work, but call will start).
            const serverUrl = `${window.location.origin}/api/vapi/webhook`;

            // Build the full assistant config with the server URL baked in
            const config = buildAssistantConfig(serverUrl);

            await vapiRef.current.start(config as any);
        } catch (error) {
            console.error("Failed to start call:", error);
            setStatus("idle");
        }
    }, []);

    // End the call
    const endCall = useCallback(() => {
        if (!vapiRef.current) return;
        vapiRef.current.stop();
        setStatus("idle");
        setIsSpeaking(false);
    }, []);

    return {
        status,
        isSpeaking,
        transcript,
        volumeLevel,
        createdEvent,
        startCall,
        endCall,
        setCreatedEvent,
    };
}
