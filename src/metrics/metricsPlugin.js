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
    resolverTime: createHistogram(
      'graphql_resolver_time',
      'The time to resolve a GraphQL field.',
      ['parentType', 'fieldName', 'returnType'],
      register,
    ),
    totalRequestTime: createHistogram(
      'graphql_total_request_time',
      'The time to complete a GraphQL query.',
      ['operationName', 'operation'],
      register,
    ),
  };

  // define the metrics plugin for apollo
  // apollo have 9 steps in their whole lifecycle

  const metricsPlugin = {
    requestDidStart() {
      console.log('request started');
      return {
        parsingDidStart(parsingContext) {
          console.log('...parsing');
          const labels = filterUndefinedValues({
            operationName: parsingContext.request.operationName || '',
            operation: parsingContext.operation?.operation,
          });
          metrics.parsed.labels(labels).inc();
        },
        validationDidStart(validationContext) {
          console.log('validation starts');
          console.log('****************', validationContext.request);
          console.log('---------------', validationContext?.operation);
          const labels = filterUndefinedValues({
            operationName: validationContext.request.operationName || '',
            operation: validationContext.operation?.operation,
          });
          metrics.validationStarted.labels(labels).inc();
        },
        didResolveOperation(resolveContext) {
          console.log('resolve starts');
          console.log('****************', resolveContext.request);
          console.log('---------------', resolveContext?.operation);
          const labels = filterUndefinedValues({
            operationName: resolveContext.request.operationName || '',
            operation: resolveContext.operation.operation,
          });
          metrics.resolved.labels(labels).inc();
        },
        executionDidStart(executingContext) {
          console.log('execution starts');
          console.log('****************', executingContext.request);
          console.log('---------------', executingContext?.operation);
          const labels = filterUndefinedValues({
            operationName: executingContext.request.operationName || '',
            operation: executingContext.operation.operation,
          });
          metrics.startedExecuting.inc(labels);
        },
        didEncounterErrors(errorContext) {
          console.log('error starts');
          console.log('****************', errorContext.request);
          console.log('---------------', errorContext?.operation);
          const labels = filterUndefinedValues({
            operationName: errorContext.request.operationName || '',
            operation: errorContext.operation?.operation,
          });
          metrics.encounteredErrors.labels(labels).inc();
        },
        willSendResponse(responseContext) {
          console.log('response starts');
          console.log('****************', responseContext.request);
          console.log('---------------', responseContext?.operation);
          const labels = filterUndefinedValues({
            operationName: responseContext.request.operationName || '',
            operation: responseContext.operation?.operation,
          });
          metrics.responded.labels(labels).inc();

          // const tracing = responseContext.response.extensions?.tracing;
          console.log(responseContext.response?.extensions);
          // if (tracing && tracing.version === 1) {
          //   metrics.totalRequestTime.observe(labels, tracing.duration / nanosToSec);

          //   tracing.execution.resolvers.forEach(({ parentType, fieldName, returnType, duration }) => {
          //     metrics.resolverTime.observe(
          //       {
          //         parentType,
          //         fieldName,
          //         returnType,
          //       },
          //       duration / nanosToSec,
          //     );
          //   });
          // }
        },
      };
    },
  };
  // return the plugin to integrate with apollo
  return metricsPlugin;
}
