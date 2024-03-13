//? Why process.hrtime vs Date.now()
// Provides high-resolution time measurements with sub-millisecond precision.
//Useful for measuring short durations, performance benchmarks, and precise
// timing in environments that support high-resolution time (like Node.js).

/**
 * Start a timer and return the current high-resolution time using process.hrtime().
 * @returns {Array} An array representing the start time obtained from process.hrtime().
 */
export const startTimer = () => process.hrtime();

/**
 * Calculate the duration in seconds between two high-resolution time points.
 * @param {Array} startTime - The start time obtained from process.hrtime().
 * @param {Array} endTime - The end time obtained from process.hrtime().
 * @returns {number} The duration in seconds.
 */
export const getDurationInSecs = (startTime, endTime) => {
  // conversion factor representing the number of nanoseconds in one second.
  const NANOS_PER_SEC = 1e9;

  const [startSec, startNano] = startTime;

  const [endSec, endNano] = endTime;
  // convert to seconds
  const durationInNanoSecs = endSec - startSec + (endNano - startNano) / NANOS_PER_SEC;
  return durationInNanoSecs;
};
