/**
 * VAPI Assistant Configuration
 * Defines the voice agent's personality, conversation flow, and available tools.
 * The server URL for tools is injected dynamically in useVapi.ts at runtime.
 */

const SYSTEM_PROMPT = `You are a friendly and efficient scheduling assistant. Your job is to help users schedule meetings by collecting the necessary details through natural conversation.

## Conversation Flow
1. Greet and ask for their name — be warm and natural.
2. Ask for the meeting date — help them pick a date. If they say "tomorrow" or "next Tuesday", work with that.
3. Ask for the preferred time — start time and optionally an end time. Default meeting length is 30 minutes if they don't specify an end time.
4. Ask for a meeting title (optional) — suggest something if they don't have one, like "Meeting with [name]".
5. Confirm all details — read back the name, date, time, and title clearly.
6. Create the event — once confirmed, call the createCalendarEvent function.
7. Confirm success — tell them the event was created and wish them a great day.

## Important Rules
- Always be conversational and natural, never robotic.
- Keep responses SHORT — 1 to 2 sentences max. You are on a voice call, not writing an essay.
- When parsing dates, always use YYYY-MM-DD format for the function call.
- When parsing times, always use HH:MM in 24-hour format for the function call.
- If the user gives a relative date like "tomorrow" or "next Friday", calculate the actual date.
- If the user gives a 12-hour time like "3pm", convert it to 24-hour format (15:00).
- If no end time is given, default to 30 minutes after the start time.
- Do not ask more than one question at a time.
- If you cannot understand something, politely ask them to repeat.`;

export function buildAssistantConfig(serverUrl: string) {
    return {
        name: "Scheduling Assistant",
        firstMessage:
            "Hey there! I'm your scheduling assistant. I can help you set up a meeting on your calendar. What's your name?",
        model: {
            provider: "openai" as const,
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system" as const,
                    content: SYSTEM_PROMPT,
                },
            ],
            tools: [
                {
                    type: "function" as const,
                    function: {
                        name: "createCalendarEvent",
                        description:
                            "Creates a new event on the user's Google Calendar. Call this after confirming all event details with the user.",
                        parameters: {
                            type: "object" as const,
                            properties: {
                                name: {
                                    type: "string",
                                    description: "The name of the person scheduling the meeting",
                                },
                                date: {
                                    type: "string",
                                    description:
                                        "The date of the meeting in YYYY-MM-DD format (e.g. 2026-02-20)",
                                },
                                startTime: {
                                    type: "string",
                                    description:
                                        "The start time of the meeting in HH:MM 24-hour format (e.g. 14:00)",
                                },
                                endTime: {
                                    type: "string",
                                    description:
                                        "The end time of the meeting in HH:MM 24-hour format (e.g. 14:30). Defaults to 30 minutes after start if not provided.",
                                },
                                title: {
                                    type: "string",
                                    description:
                                        "The title/subject of the meeting (e.g. 'Team Standup', 'Coffee Chat with John')",
                                },
                            },
                            required: ["name", "date", "startTime"],
                        },
                    },
                    async: false,
                    server: {
                        url: serverUrl,
                    },
                },
            ],
        },
        voice: {
            provider: "11labs" as const,
            voiceId: "21m00Tcm4TlvDq8ikWAM",
            stability: 0.5,
            similarityBoost: 0.75,
            useSpeakerBoost: true,
        },
        transcriber: {
            provider: "deepgram" as const,
            model: "nova-2",
            language: "en-US" as const,
        },
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 300,
        endCallMessage: "Thanks for scheduling with me! Have a wonderful day. Goodbye!",
    };
}
