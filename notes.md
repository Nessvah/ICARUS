# 1 - Project Discovery Phase

## Technology Stack

- Nodejs / Express
- GraphQL
- Apollo Server
- Prisma (ORM)
- MongoDB
- MySql
- Winston - loggers
- CORS, bcrypt - security
- JWT - Auth
- Docker
- AWS (...)

## DDD - Domain Driven Design

### Presentation Layer

Handles user interaction, user interfaces, and presentation logic:

- Graphql schema and resolvers (GraphQL)
- REST api controllers
- View, templates or components in web app

### Aplication Layer

Orchestrates use cases and contains business logic:

- Use case implementations
- Business logic related to coordinating interactions between entities

### Domain Layer

Contains the core domain logic and entities

- Entities representing core business concepts
- Aggregates that encapsulate related entities and enforce consistency
- Value objects representing concepts without identity

### Infrastructure Layer

Handles techincal concerns such as data access, external services, infrastructure-specific code. (push notifications)

- Database specific implementations
- External service clients
- Dependency injection mechanisms

## Strategy design - multiple datasources

Behavioral design pattern that defines a family of algorithms, encapsulates each algorithm, and makes them interchangeable.
It allows a client to choose an algorithm from a family of algorithms at runtime.
When integrating support for multiple databases, this pattern becomes a powerful tool.

### Components:

#### Context:

The context is the class or module that needs to perform a certain operation, in this case, database operations.
It maintains a reference to the current database strategy and delegates the database operations to the strategy.

#### Strategy:

An interface defines the contract that each database strategy must follow. It typically includes methods for common database operations, like save, update, create, delete etc.

#### Concrete Strategy:

Concrete strategy classes implement the database operations based on specific database technologies (mongodb, mysql)
Each concrete strategy adheres to the strategy interface.

### Benefits:

- **Flexibility** - easily switch between different database strategies at runtime.
- **Maintainability** - each database strategy is encapsulated in its own class, making changes and additions to specific strategies straightforward.
- **Separation of concerns** - The context class focuses on coordinating database operations without worrying about the detais of each strategy.
- **Testability** - Strategies can be tested independently, and the context can be tested with mock strategies.

With this design pattern we can create a modular and extensible architecture, enabling our application to adapt to changes in database technologies with minimal impact.
