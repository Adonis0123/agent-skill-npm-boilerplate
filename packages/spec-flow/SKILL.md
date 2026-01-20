---
name: spec-flow
description: This skill should be used when the user asks to "spec-flow", "need a plan", "create specification", "structured development", or wants to implement features using a phase-by-phase workflow with living documentation
version: 1.0.0
---

# Spec-Flow: Structured Development Workflow

Transform complex feature development into a guided, multi-phase process with living documentation.

## Overview

Spec-Flow enables specification-driven development through a four-phase workflow: Proposal, Requirements, Design, and Tasks. Each phase generates living documentation in a `.spec-flow/` directory, creating a Git-compatible structure for team collaboration.

## Core Workflow

### Phase 1: Proposal
Create a high-level feature overview:
- Feature description and objectives
- Success criteria
- Key stakeholders
- Initial scope boundaries

### Phase 2: Requirements
Document detailed requirements using EARS format:
- **WHEN** [trigger condition]
- **IF** [optional precondition]
- **THEN** the system **SHALL** [required behavior]
- **WHERE** [constraints or context]

### Phase 3: Design
Define technical implementation:
- Architecture decisions
- Component structure
- Data models
- API contracts
- Technology choices

### Phase 4: Tasks
Break down into executable work items:
- Specific, actionable tasks
- Dependencies and order
- Acceptance criteria
- Estimated complexity

## Execution Modes

**Step Mode**: Execute one task at a time with confirmation
```
Execute task by step
```

**Batch Mode**: Execute multiple tasks consecutively
```
Execute tasks in batch
```

**Phase Mode**: Execute all tasks in a specific phase
```
Execute phase [1-4]
```

## Quick Reference

| Phase | Output File | Purpose |
|-------|------------|---------|
| 1 | `proposal.md` | Feature overview and goals |
| 2 | `requirements.md` | EARS-formatted requirements |
| 3 | `design.md` | Technical specifications |
| 4 | `tasks.md` | Executable task breakdown |

## Directory Structure

```
.spec-flow/
├── proposal.md
├── requirements.md
├── design.md
└── tasks.md
```

## Best Practices

1. **Complete each phase** before advancing to the next
2. **Review and approve** phase documents before proceeding
3. **Update documents** as requirements evolve
4. **Commit `.spec-flow/`** to version control for team sharing
5. **Use EARS format** for precise, testable requirements

## Additional Resources

For detailed documentation, refer to the `references/` directory:
- EARS format guide
- Task decomposition patterns
- Workflow examples
- Template structures

---

*Note: This is a fallback version. The latest content is fetched from [echoVic/spec-flow](https://github.com/echoVic/spec-flow) during installation.*
