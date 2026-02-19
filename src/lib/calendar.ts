/**
 * Google Calendar Service
 * Creates calendar events using a Google Service Account.
 * No user OAuth required — the service account has been shared
 * with the target calendar via "Share with specific people".
 */

import { google } from "googleapis";

interface CalendarEventParams {
    name: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM (24hr)
    endTime?: string; // HH:MM (24hr) — defaults to +30min
    title?: string;
}

interface CalendarEventResult {
    success: boolean;
    eventId?: string;
    eventLink?: string;
    summary?: string;
    start?: string;
    end?: string;
    error?: string;
}

/**
 * Creates a Google Calendar event using service account credentials.
 */
export async function createCalendarEvent(
    params: CalendarEventParams
): Promise<CalendarEventResult> {
    const { name, date, startTime, title } = params;

    // Calculate end time (default 30 min after start)
    let endTime = params.endTime;
    if (!endTime) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const endDate = new Date(2000, 0, 1, hours, minutes + 30);
        endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
    }

    // Build event title
    const eventTitle = title || `Meeting with ${name}`;

    // Validate env vars
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
        console.error("Missing Google Calendar environment variables");
        return {
            success: false,
            error:
                "Calendar service is not configured. Missing environment variables.",
        };
    }

    try {
        // Authenticate with JWT
        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ["https://www.googleapis.com/auth/calendar.events"],
        });

        const calendar = google.calendar({ version: "v3", auth });

        // Build ISO datetime strings
        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        // Create the event
        const response = await calendar.events.insert({
            calendarId,
            requestBody: {
                summary: eventTitle,
                description: `Scheduled by ${name} via Voice Scheduling Agent`,
                start: {
                    dateTime: startDateTime,
                    timeZone: "Africa/Lagos", // WAT (UTC+1)
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: "Africa/Lagos",
                },
                attendees: [],
                reminders: {
                    useDefault: true,
                },
            },
        });

        const event = response.data;

        console.log(`✅ Calendar event created: ${event.id}`);
        console.log(`   Title: ${eventTitle}`);
        console.log(`   Date: ${date}`);
        console.log(`   Time: ${startTime} - ${endTime}`);
        console.log(`   Link: ${event.htmlLink}`);

        return {
            success: true,
            eventId: event.id || undefined,
            eventLink: event.htmlLink || undefined,
            summary: eventTitle,
            start: startDateTime,
            end: endDateTime,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Failed to create calendar event:", errorMessage);
        return {
            success: false,
            error: `Failed to create calendar event: ${errorMessage}`,
        };
    }
}
