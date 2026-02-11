/**
 * Time formatting utilities
 * Consolidates time formatting logic used throughout the application
 */

/**
 * Format a timestamp as HH:MM AM/PM
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Format a timestamp as MM/DD/YYYY
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format a timestamp as "MMM DD, YYYY at HH:MM AM/PM"
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = formatTime(timestamp);
  return `${month} ${day}, ${year} at ${time}`;
}

/**
 * Calculate duration between two timestamps in hours
 */
export function getDurationInHours(startTime: number, endTime: number): number {
  const durationMs = endTime - startTime;
  return durationMs / (1000 * 60 * 60);
}

/**
 * Format duration in human-readable format (e.g., "2h 30m")
 */
export function formatDuration(startTime: number, endTime: number): string {
  const durationMs = endTime - startTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
