/**
 * Format seconds into a human-readable duration string.
 * @param {number} seconds 
 * @returns {string}
 */
export function formatDuration(seconds) {
    if (seconds <= 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}
