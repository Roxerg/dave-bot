


export function parseDate(dateStr: string): Date | null {
    const monthMap: { [key: string]: number } = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    const dateRegex = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})\s+(\d{4})/;
    const match = dateRegex.exec(dateStr);

    if (match) {
        const day = parseInt(match[1]);
        const month = monthMap[match[2]];
        const year = parseInt(match[3]);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }

    return null;
}
