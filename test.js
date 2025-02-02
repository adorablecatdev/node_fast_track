function isAfterCurrentTime(timeStr, fakeCurr) {
    try {
        const now = new Date(fakeCurr);
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':');

        // Convert to 24-hour format
        let hour24 = parseInt(hours);
        if (period.toLowerCase() === 'pm' && hour24 !== 12) {
            hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hour24 === 12) {
            hour24 = 0;
        }

        const compareDate = new Date(now);
        compareDate.setHours(hour24, parseInt(minutes), 0, 0);

        // If compareDate is earlier than now, it must be for tomorrow
        // if (compareDate <= now) {
        //     compareDate.setDate(compareDate.getDate() + 1);
        // }

        return compareDate > now;
    } catch (error) {
        console.error('Error comparing times:', error);
        return false;
    }
}

console.log(isAfterCurrentTime('12:30 AM', '2024-01-01 10:02 PM'));