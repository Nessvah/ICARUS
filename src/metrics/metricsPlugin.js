import { createCounter, createHistogram, createLabels } from './helpers.js';
import { getDurationInSecs, startTimer } from '../utils/timers.js';

/**
 * Creates a metrics plugin for tracking GraphQL query metrics using Prometheus.
 * @param {Registry} register - The prometheus registry to register the metrics
 * @returns {Object} Return an apollo server plugin object for tracking graphql query
 * ,metrics
 */
export function createMetricsPlugin(register) {
  // here we can define the metrics we want for prometheus
  const metrics = {
    parsed: createCounter(
      'graphql_queries_parsed',
      'The amount of GraphQL queries that have been parsed.',
      ['operationName', 'operation'],
      register,
    ),
    validationStarted: createCounter(
      'graphql_queries_validation_started',
      'The amount of GraphQL queries that have started validation.',
      ['operationName', 'operation'],
      register,
    ),
    resolved: createCounter(
      'graphql_queries_resolved',
      'The amount of GraphQL queries that have had their operation resolved.',
      ['operationName', 'operation'],
      register,
    ),
    startedExecuting: createCounter(
      'graphql_queries_execution_started',
      'The amount of GraphQL queries that have started executing.',
      ['operationName', 'operation'],
      register,
    ),
    encounteredErrors: createCounter(
      'graphql_queries_errored',
      'The amount of GraphQL queries that have encountered errors.',
      ['operationName', 'operation'],
      register,
    ),
    responded: createCounter(
      'graphql_queries_responded',
      'The amount of GraphQL queries that have been executed and been attempted to send to the client. This includes requests with errors.',
      ['operationName', 'operation'],
      register,
    ),
    resolutionTime: createHistogram(
      'graphql_resolution_time',
      'The time taken to resolve a GraphQL query (in seconds).',
      ['operationName', 'operation'],
      register,
    ),
    executionTime: createHistogram(
      'graphql_execution_time',
      'The overall time to execute a GraphQL query (in seconds)',
      ['operationName', 'operation'],
      register,
    ),
  };

  // define the metrics plugin for apollo
  // apollo have 9 steps in their whole lifecycle

  const metricsPlugin = {
    async requestDidStart() {
      return {
        parsingDidStart(parsingContext) {
          const labels = createLabels(parsingContext);
          metrics.parsed.labels(labels).inc();
        },
        async validationDidStart(validationContext) {
          const labels = createLabels(validationContext);
          metrics.validationStarted.labels(labels).inc();
        },
        async didResolveOperation(resolveContext) {
          // record start time for resolving the operation
          resolveContext.request.resolveStartTime = startTimer();

          const labels = createLabels(resolveContext);
          metrics.resolved.labels(labels).inc();
        },
        async executionDidStart(executingContext) {
          // track current time for the execution and
          // attach the start time to the context in the req obj
          executingContext.request.startTime = startTimer();

          const labels = createLabels(executingContext);
          metrics.startedExecuting.inc(labels);
        },
        async didEncounterErrors(errorContext) {
          const labels = createLabels(errorContext);
          metrics.encounteredErrors.labels(labels).inc();
        },
        async willSendResponse(responseContext) {
          // get the start time from request

          const { startTime, resolveStartTime } = responseContext.request;

          // get current time
          const endTime = startTimer();
          const executionTime = getDurationInSecs(startTime, endTime);
          const resolutionTime = getDurationInSecs(resolveStartTime, endTime);

          const labels = createLabels(responseContext);

          metrics.executionTime.observe(labels, executionTime);
          metrics.resolutionTime.observe(labels, resolutionTime);

          metrics.responded.labels(labels).inc();
        },
      };
    },
  };
  // return the plugin to integrate with apollo
  return metricsPlugin;
}
