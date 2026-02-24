# Architecture Foundation Library

This document contains the foundational resources for software architecture, organized by topic. The Lich draws upon these resources during the architectural design process.

---

## 📚 Core Architecture Patterns

### Clean Architecture
- **Clean Architecture (Uncle Bob)** - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - Dependency Rule: Dependencies point inward
  - Entities → Use Cases → Interface Adapters → Frameworks & Drivers
  - Independent of frameworks, UI, database, and external agencies

### Hexagonal Architecture (Ports & Adapters)
- **Hexagonal Architecture** - https://alistair.cockburn.us/hexagonal-architecture/
  - Application core is isolated from external concerns
  - Ports: Interfaces for communication
  - Adapters: Implementations of ports for specific technologies

### Onion Architecture
- **Onion Architecture** - https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
  - All dependencies point to the center
  - Domain model at the core
  - No infrastructure dependencies in inner layers

---

## 🧱 Domain-Driven Design (DDD)

### Core Concepts
- **Domain-Driven Design (Eric Evans)** - https://www.domainlanguage.com/ddd/
  - Ubiquitous Language: Shared vocabulary between domain experts and developers
  - Bounded Contexts: Explicit boundaries for models
  - Aggregate Roots: Consistency boundaries
  - Value Objects vs. Entities
  - Domain Events

### Practical DDD
- **Cosmic Python (Architecture Patterns with Python)** - https://www.cosmicpython.com/
  - Repository Pattern
  - Unit of Work Pattern
  - Domain Events
  - CQRS (Command Query Responsibility Segregation)
  - Event Sourcing

---

## 🏗️ Enterprise Patterns

### Martin Fowler's Patterns
- **Patterns of Enterprise Application Architecture** - https://martinfowler.com/eaaCatalog/
  - Repository Pattern
  - Service Layer
  - Data Mapper
  - Unit of Work
  - Identity Map
  - Lazy Load

---

## 🎯 SOLID Principles

### Fundamentals
- **SOLID Principles** - https://en.wikipedia.org/wiki/SOLID
  - **S**: Single Responsibility Principle
  - **O**: Open/Closed Principle
  - **L**: Liskov Substitution Principle
  - **I**: Interface Segregation Principle
  - **D**: Dependency Inversion Principle

---

## 🔄 Software Design Principles

### General Principles
- **DRY (Don't Repeat Yourself)**: Every piece of knowledge must have a single, unambiguous, authoritative representation
- **KISS (Keep It Simple, Stupid)**: Simplicity should be a key goal in design
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's necessary
- **Separation of Concerns**: Different parts of the system should handle different responsibilities
- **Composition over Inheritance**: Favor object composition over class inheritance

---

## 🧪 Testing Architecture

### Test Pyramid
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test integration between components
- **E2E Tests**: Test the entire system from user perspective

### Test-Driven Development (TDD)
- Red → Green → Refactor cycle
- Tests drive the design
- Better code coverage and design

---

## 📐 Architectural Decision Records (ADR)

### ADR Format
- **Context**: What is the issue that we're seeing that is motivating this decision or change?
- **Decision**: What is the change that we're proposing and/or doing?
- **Consequences**: What becomes easier or more difficult to do because of this change?

### Resources
- **ADR GitHub** - https://adr.github.io/
- **Documenting Architecture Decisions** - https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

---

## 🔐 Security by Design

### OWASP
- **OWASP Top 10** - https://owasp.org/www-project-top-ten/
- **OWASP ASVS** - https://owasp.org/www-project-application-security-verification-standard/

### Secure Design Principles
- **Defense in Depth**: Multiple layers of security
- **Principle of Least Privilege**: Minimal access rights
- **Fail Secure**: System fails to a secure state
- **Don't Trust User Input**: Validate and sanitize all input

---

## 🚀 Cloud-Native Patterns

### Microservices
- **Microservices Patterns** - https://microservices.io/patterns/
  - API Gateway
  - Service Registry
  - Circuit Breaker
  - Saga Pattern

### 12-Factor App
- **The Twelve-Factor App** - https://12factor.net/
  - Codebase, Dependencies, Config, Backing Services, Build/Release/Run, etc.

---

## 📊 Data Architecture

### Data Modeling
- **Normalization**: Database design technique to reduce redundancy
- **Denormalization**: Intentional duplication for performance
- **CQRS**: Separate models for reading and writing
- **Event Sourcing**: Store state changes as events

---

## 🧠 Additional Resources

### Books
- **Clean Code** (Robert C. Martin)
- **Refactoring** (Martin Fowler)
- **Design Patterns** (Gang of Four)
- **Building Microservices** (Sam Newman)
- **Software Architecture in Practice** (Bass, Clements, Kazman)

### Online Courses & Talks
- **Clean Architecture** (Robert C. Martin talk)
- **Domain-Driven Design Distilled** (Vaughn Vernon)

---

**Usage Instructions for the Lich:**

1. Reference these patterns during **Pass 2: Architecture Skills**
2. Validate implementations against these principles in **Pass 4: Transversal Audit**
3. Document deviations from these patterns in **ADRs** with justification
4. Use these resources to educate users during **Socratic dialogue**
