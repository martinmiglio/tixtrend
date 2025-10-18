# TixTrend Monorepo Migration Tickets

This directory contains detailed tickets for migrating TixTrend from a single-app structure to a Turborepo + pnpm monorepo.

## Overview

Each ticket is a self-contained work item with:
- Estimated time
- Context and references
- Step-by-step instructions
- Acceptance criteria
- Verification commands
- Troubleshooting tips

## Tickets

### Phase 1: Infrastructure Setup
**[01-setup-monorepo-infrastructure.md](./01-setup-monorepo-infrastructure.md)** ✅ COMPLETED
- Install pnpm and Turborepo
- Create workspace configuration
- Set up root package.json and tsconfig
- **Time:** 1-2 hours

### Phase 2: Core Package
**[02-create-core-package-structure.md](./02-create-core-package-structure.md)** ✅ COMPLETED
- Create @tixtrend/core package structure
- Set up package.json and tsconfig
- **Time:** 30-45 minutes

**[03-move-business-logic-to-core.md](./03-move-business-logic-to-core.md)** ✅ COMPLETED
- Move modules and lib from site to core
- Create barrel exports
- Update internal imports to relative paths
- **Time:** 45-60 minutes

**[04-remove-tanstack-dependencies.md](./04-remove-tanstack-dependencies.md)**
- Convert createServerFn wrappers to pure handlers
- Remove framework dependencies from core
- Make business logic framework-agnostic
- **Time:** 1.5-2 hours

**[04a-refactor-core-abstractions.md](./04a-refactor-core-abstractions.md)** 🆕 ADDENDUM
- Refactor exports to expose minimal public API
- Hide internal implementation details (AWS, Ticketmaster)
- Enforce abstraction layer boundaries
- Add JSDoc documentation to public API
- **Time:** 1-1.5 hours

### Phase 3: Workers
**[05-create-workers-app.md](./05-create-workers-app.md)**
- Create @tixtrend/workers app
- Implement cron-trigger.ts handler
- Implement poll-prices-consumer.ts handler
- Direct imports from core (no HTTP calls)
- **Time:** 1.5-2 hours

### Phase 4: Site Migration
**[06-move-site-to-apps.md](./06-move-site-to-apps.md)**
- Move site directory to apps/site
- Update package.json with core dependency
- Configure TypeScript references
- Update Vite config
- **Time:** 1-1.5 hours

**[07-update-site-routes-and-api.md](./07-update-site-routes-and-api.md)**
- Update API routes to import from core
- Create TanStack wrappers for UI routes
- Remove old module imports
- **Time:** 2-2.5 hours

### Phase 5: Infrastructure
**[08-update-sst-configuration.md](./08-update-sst-configuration.md)**
- Update Lambda handler paths
- Configure nodejs.install for workspace bundling
- Remove SITE_URL and INTERNAL_API_KEY from workers
- Update site path
- **Time:** 1-1.5 hours

### Phase 6: Execution
**[09-execute-migration.md](./09-execute-migration.md)**
- Clean up old structure
- Install dependencies with pnpm
- Run typecheck and build
- Deploy to dev environment
- **Time:** 1.5-2 hours

### Phase 7: Testing
**[10-testing-and-validation.md](./10-testing-and-validation.md)**
- Test build and type safety
- Verify infrastructure
- Test workers (cron and SQS)
- Test site functionality
- Integration testing
- Performance validation
- **Time:** 2-3 hours

### Phase 8: Documentation
**[11-update-documentation.md](./11-update-documentation.md)**
- Update ARCHITECTURE.md
- Document monorepo structure
- Update flow diagrams
- Document development workflow
- **Time:** 1-1.5 hours

## Total Estimated Time

**13-16.5 hours** total across all phases (includes addendum ticket 4a: +1-1.5 hours)

## Migration Path

Tickets should be completed **in order** as each depends on the previous:

```
01 → 02 → 03 → 04 → 04a → 05 → 06 → 07 → 08 → 09 → 10 → 11
```

**Note**: Ticket 04a is an addendum that refactors core package abstractions after removing TanStack dependencies.

## Key Architectural Changes

### Before Migration
```
Lambda → HTTP POST → API Route → Business Logic → DynamoDB
```

### After Migration
```
Lambda → import { handler } from '@tixtrend/core' → DynamoDB
```

**Benefits:**
- ✅ Reduced latency (no HTTP roundtrip)
- ✅ Lower costs (fewer invocations, no API Gateway)
- ✅ Simpler architecture (direct function calls)
- ✅ Better code organization (DDD/Hexagonal)
- ✅ Shared business logic (DRY principle)

## Quick Start

1. Read [MONOREPO_MIGRATION.md](../MONOREPO_MIGRATION.md) for full context
2. Start with ticket 01
3. Complete each ticket in order
4. Test thoroughly at each phase
5. Document any issues or deviations

## Important Notes

- **Do not skip tickets** - each builds on the previous
- **Test incrementally** - don't wait until the end
- **Commit frequently** - commit after each ticket or major step
- **Document issues** - note any problems for future reference
- **Ask questions** - if anything is unclear, ask before proceeding

## Support Resources

- [MONOREPO_MIGRATION.md](../MONOREPO_MIGRATION.md) - Full migration plan
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Current architecture
- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [SST v3 Docs](https://sst.dev/docs/)

## Troubleshooting

If you encounter issues:
1. Check the ticket's troubleshooting section
2. Review MONOREPO_MIGRATION.md Potential Issues section
3. Search for similar issues in SST/Turborepo GitHub
4. Check CloudWatch logs for runtime errors

## Post-Migration

After completing all tickets:
- [ ] All tests pass
- [ ] Dev environment deployed and tested
- [ ] Documentation updated
- [ ] Migration reviewed
- [ ] Ready for production deployment

Then:
1. Create PR with all changes
2. Get code review
3. Deploy to production
4. Monitor for 24-48 hours
5. Consider removing old API routes if not needed
6. Update team documentation

## Questions?

Refer to:
- Main migration plan: `docs/MONOREPO_MIGRATION.md`
- Architecture docs: `docs/ARCHITECTURE.md`
- Individual ticket files for detailed steps
