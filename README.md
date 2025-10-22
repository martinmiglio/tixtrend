# TixTrend

[![TixTrend](https://tixtrend.martinmiglio.dev/og)](https://tixtrend.martinmiglio.dev/)

TixTrend is a website that allows you to track ticket prices for your favorite events over time. It provides a user-friendly interface to visualize historical price trends and make informed decisions about purchasing tickets.

The project is built using **TanStack Start** for the web application, with serverless **AWS Lambda** functions for automated price polling, and **DynamoDB** for data storage. Infrastructure is managed with **SST v3** and deployed on AWS. The codebase is organized as a **Turborepo + pnpm monorepo** for efficient code sharing between the site and workers.

## About TixTrend

TixTrend lets you easily monitor ticket prices for various events. Here are some key features:

### Track Ticket Prices Over Time

With TixTrend, you can easily track ticket prices for your favorite events over time. The powerful tool allows you to view historical trends, helping you decide when the best time is to purchase your tickets.

[Search for an event now ↣](https://tixtrend.martinmiglio.dev/)

### Data from Ticketmaster's Discover API

TixTrend collects its data from Ticketmaster's Discover API, which is a reliable source for event and ticket information. The integration ensures that the information you receive is accurate and up-to-date.

[Learn more about Ticketmaster's Discover API ↣](https://developer.ticketmaster.com/explore/)

## Monorepo Structure

This project uses a Turborepo + pnpm monorepo:

```
tixtrend/
├── apps/
│   ├── site/              # TanStack Start web app
│   └── workers/           # Lambda handlers
├── packages/
│   └── core/              # Shared business logic
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml    # pnpm workspace config
```

**Key packages:**

- `@tixtrend/core` - Framework-agnostic business logic shared between site and workers
- `@tixtrend/workers` - AWS Lambda handlers that directly import from core (no HTTP calls)
- `@tixtrend/site` - TanStack Start web application

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- AWS account (for deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
pnpm sst dev

# In a separate terminal, start the site
cd apps/site
pnpm dev
```

### Development Commands

```bash
# Type check all packages
pnpm typecheck

# Build all packages
pnpm build

# Deploy to AWS (dev stage)
pnpm sst deploy --stage dev

# Deploy to production
pnpm sst deploy --stage production
```

### Architecture

TixTrend follows Domain-Driven Design (DDD) and Hexagonal Architecture principles:

- **Domain Layer** (@tixtrend/core): Pure business logic
- **Application Layer** (workers & site): Adapters that use the domain logic
- **Infrastructure Layer**: AWS services (DynamoDB, SQS, Lambda, EventBridge)

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

We welcome contributions from the community! To contribute to TixTrend, follow these steps:

1. Fork this repository.
2. Create a new branch for your feature/bug fix: `git checkout -b feature/my-new-feature`.
3. Make your changes and test thoroughly.
4. Commit your changes: `git commit -m "Add a new feature"`.
5. Push to your branch: `git push origin feature/my-new-feature`.
6. Create a pull request detailing your changes.

## License

TixTrend is released under the [MIT License](LICENSE).

---

For more information, visit the [TixTrend website](https://tixtrend.martinmiglio.dev/) or contact us at <tixtrend@martinmiglio.dev>.
