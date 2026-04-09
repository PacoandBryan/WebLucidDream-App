function checkTimeLock(targetTime, now) {
    const [tHour, tMin] = targetTime.split(':').map(Number);

    const todayTarget = new Date(now);
    todayTarget.setHours(tHour, tMin, 0, 0);

    const yesterdayTarget = new Date(todayTarget);
    yesterdayTarget.setDate(yesterdayTarget.getDate() - 1);

    const diffMinsToday = (now - todayTarget) / (1000 * 60);
    const diffMinsYesterday = (now - yesterdayTarget) / (1000 * 60);

    const diffMins = Math.abs(diffMinsToday) < Math.abs(diffMinsYesterday) ? diffMinsToday : diffMinsYesterday;

    if (diffMins >= -20 && diffMins <= 240) {
        return { isLocked: false, status: 'ACTIVE', label: 'ENGAGE' };
    }
    else if (diffMins > 240) {
        return { isLocked: true, status: 'FAIL', label: 'SYS_FAIL' };
    }
    else {
        return { isLocked: true, status: 'LOCKED', label: 'OFFLINE' };
    }
}

const testTarget = "20:00";
const cases = [
    { time: "19:30", expectedLocked: true, expectedLabel: "OFFLINE" },
    { time: "19:40", expectedLocked: false, expectedLabel: "ENGAGE" },
    { time: "23:59", expectedLocked: false, expectedLabel: "ENGAGE" },
    { time: "00:00", expectedLocked: false, expectedLabel: "ENGAGE", nextDay: true },
    { time: "00:01", expectedLocked: true, expectedLabel: "SYS_FAIL", nextDay: true }
];

cases.forEach(c => {
    const now = new Date();
    const [h, m] = c.time.split(':').map(Number);
    now.setHours(h, m, 0, 0);
    if (c.nextDay) now.setDate(now.getDate() + 1);

    const result = checkTimeLock(testTarget, now);
    console.log(`Time: ${c.time}, Locked: ${result.isLocked}, Label: ${result.label}`);
    if (result.isLocked !== c.expectedLocked || result.label !== c.expectedLabel) {
        console.error(`FAILED TEST CASE. Expected Locked: ${c.expectedLocked}, Label: ${c.expectedLabel}`);
        process.exit(1);
    }
});
console.log("ALL TIME-LOCK LOGIC TESTS PASSED");
