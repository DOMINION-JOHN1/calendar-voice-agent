"use client";

/**
 * EventCard Component
 * Shown after a calendar event has been successfully created.
 * Displays event details with a success animation and
 * a link to view the event in Google Calendar.
 */

interface EventCardProps {
    summary: string;
    date: string;
    startTime: string;
    endTime: string;
    link?: string;
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

function formatDate(dateStr: string): string {
    try {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatTime(time24: string): string {
    try {
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    } catch {
        return time24;
    }
}

export default function EventCard({
    summary,
    date,
    startTime,
    endTime,
    link,
}: EventCardProps) {
    return (
        <div className="event-card">
            <div className="event-card__header">
                <div className="event-card__check">
                    <CheckIcon />
                </div>
                <div className="event-card__title">Event Created Successfully!</div>
            </div>

            <div className="event-card__details">
                <div className="event-card__field">
                    <span className="event-card__label">Event</span>
                    <span className="event-card__value">{summary}</span>
                </div>
                <div className="event-card__field">
                    <span className="event-card__label">Date</span>
                    <span className="event-card__value">{formatDate(date)}</span>
                </div>
                <div className="event-card__field">
                    <span className="event-card__label">Start</span>
                    <span className="event-card__value">{formatTime(startTime)}</span>
                </div>
                <div className="event-card__field">
                    <span className="event-card__label">End</span>
                    <span className="event-card__value">{formatTime(endTime)}</span>
                </div>
            </div>

            {link && (
                <a
                    className="event-card__link"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLinkIcon />
                    View in Google Calendar
                </a>
            )}
        </div>
    );
}
