/**
 * VAPI Webhook Handler
 * Receives tool-call requests from VAPI when the voice agent
 * decides to invoke the createCalendarEvent function.
 *
 * VAPI sends a POST with a message object. When type is "tool-calls",
 * we extract the function name + arguments and dispatch accordingly.
 */

import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/calendar";

// VAPI webhook payload types
interface VapiToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: Record<string, string>;
    };
}

interface VapiWebhookPayload {
    message: {
        type: string;
        toolCallList?: VapiToolCall[];
        toolCalls?: VapiToolCall[]; // VAPI uses this field name
        call?: Record<string, unknown>;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: VapiWebhookPayload = await request.json();
        const { message } = body;

        console.log("📞 VAPI webhook received:", JSON.stringify(message.type));

        // Handle different message types
        switch (message.type) {
            case "tool-calls": {
                // VAPI may use "toolCalls" or "toolCallList"
                const toolCalls = message.toolCallList || message.toolCalls || [];
                const results = [];

                for (const toolCall of toolCalls) {
                    console.log(
                        `🔧 Tool call: ${toolCall.function.name}`,
                        JSON.stringify(toolCall.function.arguments)
                    );

                    if (toolCall.function.name === "createCalendarEvent") {
                        const args = toolCall.function.arguments;

                        // Parse arguments (may come as string from VAPI)
                        const parsedArgs =
                            typeof args === "string" ? JSON.parse(args) : args;

                        const result = await createCalendarEvent({
                            name: parsedArgs.name,
                            date: parsedArgs.date,
                            startTime: parsedArgs.startTime,
                            endTime: parsedArgs.endTime,
                            title: parsedArgs.title,
                        });

                        results.push({
                            toolCallId: toolCall.id,
                            result: result.success
                                ? `Event "${result.summary}" has been successfully created for ${result.start} to ${result.end}. Calendar link: ${result.eventLink}`
                                : `Sorry, I couldn't create the event: ${result.error}`,
                        });
                    } else {
                        results.push({
                            toolCallId: toolCall.id,
                            result: `Unknown tool: ${toolCall.function.name}`,
                        });
                    }
                }

                return NextResponse.json({ results });
            }

            case "status-update": {
                console.log("📊 Status update:", JSON.stringify(body));
                return NextResponse.json({ ok: true });
            }

            case "end-of-call-report": {
                console.log("📋 Call ended:", JSON.stringify(body));
                return NextResponse.json({ ok: true });
            }

            case "hang": {
                console.log("📴 Call hung up");
                return NextResponse.json({ ok: true });
            }

            case "function-call": {
                // Legacy function call format
                const functionCall = body.message as unknown as {
                    functionCall: {
                        name: string;
                        parameters: Record<string, string>;
                    };
                };

                if (functionCall.functionCall?.name === "createCalendarEvent") {
                    const result = await createCalendarEvent(
                        functionCall.functionCall.parameters as {
                            name: string;
                            date: string;
                            startTime: string;
                            endTime?: string;
                            title?: string;
                        }
                    );

                    return NextResponse.json({
                        result: result.success
                            ? `Event "${result.summary}" has been successfully created for ${result.start} to ${result.end}. Calendar link: ${result.eventLink}`
                            : `Sorry, I couldn't create the event: ${result.error}`,
                    });
                }
                return NextResponse.json({ result: "Unknown function" });
            }

            default: {
                console.log(`ℹ️ Unhandled message type: ${message.type}`);
                return NextResponse.json({ ok: true });
            }
        }
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Health check for the webhook
export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "Voice Scheduling Agent - VAPI Webhook",
        timestamp: new Date().toISOString(),
    });
}
