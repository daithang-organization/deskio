# Architecture Decision Records (ADR)

Thư mục này chứa các Architecture Decision Records (ADRs) - tài liệu về các quyết định kiến trúc quan trọng trong Deskio project.

## Mục đích

ADRs giúp:
- Document lý do đằng sau các quyết định kỹ thuật quan trọng
- Provide context cho team members hiện tại và tương lai
- Track evolution của architecture qua thời gian
- Avoid revisiting đã-resolved decisions
- Facilitate onboarding và knowledge transfer

## Khi nào tạo ADR?

Tạo ADR khi:
- ✅ Chọn tech stack major (framework, database, language)
- ✅ Thay đổi architectural patterns
- ✅ Chọn third-party services hoặc libraries quan trọng
- ✅ Database schema design decisions
- ✅ Security/compliance decisions
- ✅ API design conventions
- ✅ Infrastructure choices
- ✅ Deployment strategies

Không cần ADR cho:
- ❌ Minor bug fixes
- ❌ Routine refactoring
- ❌ UI/UX changes (unless architectural impact)
- ❌ Content updates

## ADR Format

### Filename Convention

```
XXXX-title-in-kebab-case.md
```

Examples:
- `0001-use-nestjs-framework.md`
- `0002-choose-postgresql-database.md`
- `0003-implement-multi-tenant-workspace.md`

### Template Structure

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context

[Mô tả vấn đề cần giải quyết, constraints, requirements]

## Decision

[Quyết định đã chọn và lý do tại sao]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Tradeoff 1]
- [Tradeoff 2]

### Neutral
- [Other impact]

## Alternatives Considered

### Alternative 1: [Name]
- Pros: ...
- Cons: ...
- Why not chosen: ...

### Alternative 2: [Name]
- Pros: ...
- Cons: ...
- Why not chosen: ...

## References

- [Link to discussions]
- [Documentation links]
- [Related ADRs]
```

## Example ADRs

### ADR-0001: Use NestJS Framework

```markdown
# 1. Use NestJS Framework for Backend Services

Date: 2026-01-15

## Status

Accepted

## Context

We need to choose a Node.js framework for building our backend services (identity, ticket, kb, notification). Requirements:
- TypeScript support
- Good structure and scalability
- Active community and ecosystem
- Built-in features (DI, validation, etc.)
- Easy to test

## Decision

We will use NestJS as our primary backend framework.

## Consequences

### Positive
- Excellent TypeScript support out of the box
- Angular-like architecture familiar to many developers
- Built-in dependency injection
- Extensive ecosystem (Swagger, validation, testing)
- Microservices support for future scaling
- Active community and good documentation

### Negative
- Steeper learning curve than Express
- More opinionated (less flexibility)
- Larger bundle size

## Alternatives Considered

### Alternative 1: Express.js
- Pros: Lightweight, flexible, huge ecosystem
- Cons: Minimal structure, need to add everything manually
- Why not: Need more structure for team collaboration

### Alternative 2: Fastify
- Pros: Very fast, good TypeScript support
- Cons: Smaller ecosystem, less batteries-included
- Why not: NestJS provides more out-of-the-box features

## References
- [NestJS Documentation](https://docs.nestjs.com/)
- Team discussion: Slack thread (link)
```

### ADR-0002: Choose PostgreSQL as Primary Database

```markdown
# 2. Choose PostgreSQL as Primary Database

Date: 2026-01-15

## Status

Accepted

## Context

Need to select a database for storing:
- User and authentication data
- Tickets and replies
- Knowledge base articles
- Multi-tenant workspace data

Requirements:
- ACID compliance
- Complex queries support
- Full-text search
- Good performance
- Reliable and mature

## Decision

We will use PostgreSQL as our primary database for all services.

## Consequences

### Positive
- ACID compliance ensures data consistency
- Excellent support for complex queries and joins
- Built-in full-text search
- JSON support for flexible data
- Mature and battle-tested
- Great tooling and ecosystem
- Free and open source

### Negative
- Requires more setup than NoSQL
- Vertical scaling limitations (mitigated by proper design)
- Schema migrations needed for changes

## Alternatives Considered

### Alternative 1: MongoDB
- Pros: Flexible schema, easy to start
- Cons: No ACID transactions (in older versions), eventual consistency issues
- Why not: Need strong consistency for tickets and transactions

### Alternative 2: MySQL
- Pros: Popular, good performance
- Cons: Less advanced features than PostgreSQL
- Why not: PostgreSQL offers more features we need (JSON, full-text search)

## References
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Why Postgres?](https://www.postgresql.org/about/)
```

### ADR-0003: Implement Multi-Tenant via Workspace ID

```markdown
# 3. Implement Multi-Tenant via Workspace ID

Date: 2026-01-16

## Status

Accepted

## Context

Deskio needs to support multiple workspaces (organizations) on the same infrastructure. Need to decide on multi-tenancy approach:
- Separate database per workspace
- Shared database with workspace_id
- Schema per workspace

Requirements:
- Data isolation
- Cost-effective
- Scalable
- Simple to manage

## Decision

We will implement multi-tenancy using a shared database with workspace_id column in all tables.

## Consequences

### Positive
- Simple to implement and maintain
- Cost-effective (single database)
- Easy to add new workspaces
- All data in one place for analytics
- Easy to backup and restore
- Can add row-level security (RLS) later

### Negative
- Must be careful with queries (always filter by workspace_id)
- Risk of data leakage if queries miss workspace_id
- All workspaces share resources
- Noisy neighbor problem possible

### Neutral
- Need strict code review for all queries
- Need workspace-aware ORM/query patterns

## Alternatives Considered

### Alternative 1: Separate Database Per Workspace
- Pros: Complete isolation, easy to scale per customer
- Cons: Complex management, expensive, hard to do cross-workspace analytics
- Why not: Too complex for MVP, over-engineering

### Alternative 2: Schema Per Workspace
- Pros: Better isolation than shared tables
- Cons: Migration complexity, limited by DB schema limits
- Why not: More complexity than needed for MVP

## Implementation Notes
- Add workspace_id to all data models
- Create middleware to inject workspace_id
- Add database indexes on workspace_id
- Implement audit logging for workspace access
- Consider PostgreSQL RLS for future

## References
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview)
- Internal design doc: (link)
```

## ADR Workflow

### Creating New ADR

1. **Copy template:**
   ```bash
   cp docs/adr/0000-template.md docs/adr/XXXX-your-decision.md
   ```

2. **Fill in sections:**
   - Set status to "Proposed"
   - Describe context clearly
   - Document decision and rationale
   - List consequences honestly
   - Include alternatives considered

3. **Review with team:**
   - Share in team meeting
   - Get feedback and approval
   - Update based on discussions

4. **Finalize:**
   - Change status to "Accepted"
   - Commit to repository
   - Communicate to team

### Updating Existing ADR

ADRs are immutable once accepted. To change a decision:

1. Create new ADR superseding the old one
2. Update old ADR status to "Superseded by ADR-XXXX"
3. Reference old ADR in new one

Example:
```markdown
# 5. Use Elasticsearch for Full-Text Search

Date: 2026-03-01

## Status

Accepted (Supersedes ADR-0002)

## Context

PostgreSQL full-text search is insufficient for our growing needs...
```

## ADR Statuses

- **Proposed:** Decision is under discussion
- **Accepted:** Decision is approved and implemented
- **Deprecated:** No longer relevant (context changed)
- **Superseded by ADR-XXX:** Replaced by newer decision

## Best Practices

### Writing ADRs

- ✅ Be concise but thorough
- ✅ Include specific technical details
- ✅ Be honest about tradeoffs
- ✅ Document alternatives considered
- ✅ Add references and links
- ✅ Use clear, simple language
- ✅ Focus on "why" not just "what"

### Maintaining ADRs

- ✅ Review ADRs during onboarding
- ✅ Reference ADRs in code reviews
- ✅ Update when context changes significantly
- ✅ Link ADRs to related issues/PRs
- ✅ Keep ADR index updated

### Common Pitfalls

- ❌ Too much detail (not a specification)
- ❌ Too little detail (missing context)
- ❌ Editing accepted ADRs (create new one instead)
- ❌ Not documenting alternatives
- ❌ Missing consequences (tradeoffs)

## ADR Index

Maintain index of all ADRs:

| Number | Title | Status | Date |
|--------|-------|--------|------|
| [0000](0000-template.md) | ADR Template | Template | - |
| [0001](0001-use-nestjs.md) | Use NestJS Framework | Accepted | 2026-01-15 |
| [0002](0002-choose-postgresql.md) | Choose PostgreSQL | Accepted | 2026-01-15 |
| [0003](0003-multi-tenant-workspace.md) | Multi-Tenant via Workspace ID | Accepted | 2026-01-16 |
| ... | ... | ... | ... |

## Tools

### Generate ADR

```bash
# Create new ADR with next number
./scripts/new-adr.sh "Your Decision Title"
```

### List ADRs

```bash
# List all ADRs with status
./scripts/list-adrs.sh
```

## Related Documentation

- [Architecture Overview](../architecture.md)
- [API Conventions](../api-conventions.md)
- [Development Guide](../development.md)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR Tools](https://github.com/npryce/adr-tools)

## Notes

- ADRs are living documentation
- They evolve with the project
- Regular review keeps them relevant
- They're for the team, not external consumption
- Quality over quantity
- Focus on significant decisions
