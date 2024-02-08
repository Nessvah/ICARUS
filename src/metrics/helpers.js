import { Counter, Histogram } from 'prom-client';

/**
 * Creates a Prometheus counter metric with the specified name, help message, label names, and registry.
 * @param {string} name - name of counter metric
 * @param {string} help - help message describing the counter metrics
 * @param {string[]} label - an array of label names associated with the counter metric
 * @param {Registry} register - The prometheus registry to register the counter metrics
 * @returns {Counter} - Returns a prometheus counter metrics instance.
 */
export function createCounter(name, help, labelNames, register) {
  return new Counter({
    name,
    help,
    labelNames,
    registers: [register],
  });
}

/**
 * CCreates a Prometheus histogram metric with the specified name, help message, label names, and registry.
 * @param {string} name - name of counter metric
 * @param {string} help - help message describing the counter metrics
 * @param {string[]} label - an array of label names associated with the counter metric
 * @param {Registry} register - The prometheus registry to register the counter metrics
 * @returns {Counter} - Returns a prometheus counter metrics instance.
 */
export function createHistogram(name, help, label, register) {
  return new Histogram({
    name,
    help,
    label,
    registers: [register],
  });
}
