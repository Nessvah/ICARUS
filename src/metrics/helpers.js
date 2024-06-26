import { Counter, Histogram } from 'prom-client';
import { filterUndefinedValues } from '../utils/filter.js';

/**
 * Creates a Prometheus counter metric with the specified name, help message, label names, and registry.
 * @param {string} name - name of counter metric
 * @param {string} help - help message describing the counter metrics
 * @param {string[]} labelNames - an array of label names associated with the counter metric
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
 * @param {string[]} labelNames - an array of label names associated with the counter metric
 * @param {Registry} register - The prometheus registry to register the counter metrics
 * @returns {Histogram} - Returns a prometheus histogram metrics instance.
 */
export function createHistogram(name, help, labelNames, register) {
  return new Histogram({
    name,
    help,
    labelNames,
    registers: [register],
    buckets: [0.1, 0.5, 1, 5, 10],
  });
}

/**
 * Creates labels for a GraphQL context.
 * @param {Object} context - The GraphQL context object.
 * @returns {Object} - Labels for the GraphQL context.
 */
// ... previous code

export function createLabels(context) {
  return filterUndefinedValues({
    operationName: context.request.operationName?.toLowerCase() || '', // Use toLowerCase() to convert to lowercase
    operation: context.operation?.operation,
  });
}
