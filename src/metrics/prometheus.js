import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// this will collect the default metrics and register them
client.collectDefaultMetrics({
  app: 'icarus-monitoring',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register,
});

// This counter will track the total number of http requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of http requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// counter for tracking the total number of Graphql requests
const graphqlRequestCounter = new client.Counter({
  name: 'graphql_requests_total',
  help: 'Total number of GraphQL requests',
  labelNames: ['operation', 'status'],
  registers: [register],
});

// Object to store the active Gauges for different request types:
//? A guage keeps track of the number of active requests or connections
//? ex: inc the guage when a req comes in and dec when the req is completed.

const activeGauges = {};

// Gauge for tracking number of active requests with labels
const activeGauge = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active requests',
  labelNames: ['type'],
  registers: [register],

  collect() {
    // this will collect metrics when they are scraped
    const count = Object.keys(activeGauges).length;

    // set the count as the value of the Gauge
    this.set(count);
  },
});

// timer function

const startRequestTimer = (type) => {
  // start recording the time
  const start = Date.now();

  return {
    done: () => {
      // record the end of request
      const end = Date.now();

      const duration = end - start;

      // increment the http req counter
      httpRequestCounter.labels(type).inc();

      // decrement the gauge
      activeGauge.labels(type).dec();

      // remove the entry from the object
      delete activeGauges[type];

      console.log(`Request duration for ${type}: ${duration} ms`);
    },
  };
};

export { register, httpRequestCounter, graphqlRequestCounter, activeGauge, startRequestTimer };
