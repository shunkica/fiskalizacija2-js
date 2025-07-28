export function getCurrentDateTimeString() {
    const now = new Date();

    const pad = (number: number, length = 2) => String(number).padStart(length, '0');
    const padMilliseconds = (ms: number) => String(ms).padEnd(4, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const milliseconds = padMilliseconds(now.getMilliseconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}
