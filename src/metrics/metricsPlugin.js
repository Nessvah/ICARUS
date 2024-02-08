import { createCounter, createHistogram } from './helpers.js';
import { filterUndefinedValues } from '../utils/filter.js';
import { logger } from '../infrastructure/server.js';

// nano to sec so that its easier for us to know the time that it took
const nanosToSec = 1_000_000_000;

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
          const { operationName } = parsingContext.request;
          const isIntrospection = operationName.includes('IntrospectionQuery');

          // remove introspection queries from prometheus data
          if (!isIntrospection) {
            const labels = filterUndefinedValues({
              operationName: parsingContext.request.operationName || '',
              operation: parsingContext.operation?.operation,
            });
            metrics.parsed.labels(labels).inc();
          }
        },
        async validationDidStart(validationContext) {
          const { operationName } = validationContext.request;
          const isIntrospection = operationName.includes('IntrospectionQuery');

          if (!isIntrospection) {
            const labels = filterUndefinedValues({
              operationName: validationContext.request.operationName || '',
              operation: validationContext.operation?.operation,
            });
            metrics.validationStarted.labels(labels).inc();
          }
        },
        async didResolveOperation(resolveContext) {
          const { operationName } = resolveContext.request;
          const isIntrospection = operationName.includes('IntrospectionQuery');

          if (!isIntrospection) {
            const labels = filterUndefinedValues({
              operationName: resolveContext.request.operationName || '',
              operation: resolveContext.operation.operation,
            });
            metrics.resolved.labels(labels).inc();
          }
        },
        async executionDidStart(executingContext) {
          const { operationName } = executingContext.request;
          const isIntrospection = operationName.includes('IntrospectionQuery');

          if (!isIntrospection) {
            // track current time
            const startTime = process.hrtime();

            // attach the start time to the context in the req obj
            executingContext.request.startTime = startTime;

            const labels = filterUndefinedValues({
              operationName: executingContext.request.operationName || '',
              operation: executingContext.operation.operation,
            });
            metrics.startedExecuting.inc(labels);
          }
        },
        async didEncounterErrors(errorContext) {
          const labels = filterUndefinedValues({
            operationName: errorContext.request.operationName || '',
            operation: errorContext.operation?.operation,
          });
          metrics.encounteredErrors.labels(labels).inc();
        },
        async willSendResponse(responseContext) {
          const { operationName } = responseContext.request;
          const isIntrospection = operationName.includes('IntrospectionQuery');

          if (!isIntrospection) {
            // get the start time from request

            const { startTime } = responseContext.request;

            let labels;

            if (startTime) {
              try {
                // calculate duration
                const endTime = process.hrtime(startTime);
                // it returns [seconds, nanoseconds]
                const durationNanos = endTime[0] * 1e9 + endTime[1];

                // convert from nanos to secs
                const durationSecs = durationNanos / nanosToSec;

                labels = filterUndefinedValues({
                  operationName: responseContext.request.operationName || '',
                  operation: responseContext.operation?.operation,
                });
                metrics.executionTime.observe(labels, durationSecs);
                metrics.resolutionTime.observe(labels, durationSecs);
              } catch (e) {
                logger.error(e);
              }
            }

            metrics.responded.labels(labels).inc();
          }
        },
      };
    },
  };
  // return the plugin to integrate with apollo
  return metricsPlugin;
}
