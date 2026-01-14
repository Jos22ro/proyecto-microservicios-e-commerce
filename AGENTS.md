# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this microservices repository.

## Project Overview

This is a polyglot microservices architecture with:
- **Frontend**: Vue.js 3 + Vite + Tailwind CSS + Pinia
- **Auth Service**: Python (FastAPI) + SQL
- **Products Service**: PHP (Laravel) + SQL  
- **Inventory Service**: Rust (Axum) + PostgreSQL
- **Orders Service**: Node.js (Express) + MongoDB

## Build Commands

### Frontend (Vue.js)
```bash
cd frontend
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Auth Service (Python FastAPI)
```bash
cd auth_service
pip install -r requirements.txt    # Install dependencies
uvicorn main:app --reload           # Start development server
python -m pytest                    # Run tests (if configured)
```

### Products Service (Laravel)
```bash
cd product-service
composer install     # Install dependencies
php artisan serve     # Start development server
php artisan migrate   # Run database migrations
php artisan test      # Run all tests
php artisan test --filter TestName  # Run specific test
vendor/bin/phpunit tests/Feature/ExampleTest.php  # Run single test file
composer run lint     # Run Laravel Pint (code formatter)
```

### Inventory Service (Rust)
```bash
cd InventoryService
cargo build          # Build project
cargo run            # Start development server
cargo test           # Run tests
cargo clippy         # Lint code
cargo fmt            # Format code
```

### Docker Commands
```bash
docker-compose up --build -d    # Build and start all services
docker-compose down             # Stop all services
docker-compose logs -f service  # Follow logs for specific service
```

## Code Style Guidelines

### Frontend (Vue.js)

#### File Structure
- Components: `src/components/ComponentName.vue` (PascalCase)
- Views: `src/views/ViewName.vue` (PascalCase)
- Stores: `src/stores/storeName.js` (camelCase)
- Router: `src/router.js`

#### Vue Component Style
- Use `<script setup>` syntax
- Import statements at the top of script section
- Reactive data with `ref()` or `reactive()`
- Computed properties with `computed()`
- Methods as regular functions
- Props defined with `defineProps()`
- Emits defined with `defineEmits()`

#### CSS/Tailwind
- Use Tailwind utility classes
- Avoid custom CSS unless absolutely necessary
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Component-specific styles in `<style scoped>` if needed

#### JavaScript/TypeScript
- ES6+ syntax preferred
- Arrow functions for callbacks
- Destructuring for objects/arrays
- Async/await for asynchronous operations
- Error handling with try/catch blocks

#### Naming Conventions
- Components: PascalCase (ProductCard.vue)
- Props: camelCase (productName)
- Events: kebab-case (@update-product)
- Variables/Functions: camelCase (getUserData)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)

### Auth Service (Python FastAPI)

#### File Structure
- Main: `main.py` (FastAPI app initialization)
- Routers: `routers/` (API route definitions)
- Models: `models.py` (SQLAlchemy models)
- Schemas: `schemas.py` (Pydantic models)
- Database: `database.py` (DB connection)
- Security: `security.py` (JWT/auth logic)

#### Python Code Style
- Follow PEP 8 coding standard
- Use type hints for function parameters and return types
- Docstrings for functions and classes
- Use SQLAlchemy ORM for database operations
- Pydantic models for API validation

#### Naming Conventions
- Classes: PascalCase (UserModel)
- Functions/Variables: snake_case (get_user_data)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Files: snake_case (auth_service.py)

### Products Service (Laravel)

#### File Structure
- Controllers: `app/Http/Controllers/ControllerName.php`
- Models: `app/Models/ModelName.php`
- Migrations: `database/migrations/YYYY_MM_DD_HHMMSS_create_table_name.php`
- Routes: `routes/web.php` or `routes/api.php`

#### PHP Code Style
- Follow PSR-12 coding standard
- Use Laravel Pint for formatting (`composer run lint`)
- Type declarations for method parameters and return types
- DocBlocks for methods and classes
- Use Eloquent ORM for database operations

#### Naming Conventions
- Classes: PascalCase (ProductController)
- Methods: camelCase (getProducts)
- Variables: camelCase ($productData)
- Constants: UPPER_SNAKE_CASE (API_VERSION)
- Database tables: snake_case (product_categories)

#### API Design
- RESTful endpoints
- Resource classes for API responses
- Form Request validation classes
- Proper HTTP status codes
- Error handling with try/catch

### Inventory Service (Rust)

#### File Structure
- Main: `src/main.rs` (Application entry point)
- Handlers: `src/handlers.rs` (HTTP request handlers)
- Models: `src/models.rs` (Data structures)
- Routes: `src/routes.rs` (Route definitions)
- Database: `src/db.rs` (Database connection)
- Logic: `src/*_logic.rs` (Business logic modules)

#### Rust Code Style
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Prefer `Result<T, E>` for error handling
- Use `async/await` for async operations
- Strong typing with explicit type annotations

#### Naming Conventions
- Functions/Variables: snake_case (get_user_data)
- Types/Structs: PascalCase (UserData)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Modules: snake_case (auth_service)

## Testing Guidelines

### Frontend Testing
- No specific test framework configured yet
- Manual testing in browser recommended

### Laravel Testing
- PHPUnit for unit and feature tests
- Test files in `tests/Unit/` and `tests/Feature/`
- Use Laravel's built-in testing helpers
- Database transactions for test isolation
- Factory classes for test data

#### Running Tests
```bash
# All tests
php artisan test

# Specific test file
vendor/bin/phpunit tests/Feature/ExampleTest.php

# Specific test method
php artisan test --filter test_the_application_returns_a_successful_response

# With coverage
php artisan test --coverage
```

## Error Handling

### Frontend
- Use try/catch blocks for async operations
- Display user-friendly error messages
- Log errors to console for debugging
- Loading states for async operations

### Auth Service (Python)
- Use FastAPI's exception handlers
- Return proper HTTP status codes
- Validate input with Pydantic models
- Use database sessions for transactions

### Laravel
- Use Laravel's exception handling
- Return proper HTTP status codes
- Validate input with Form Requests
- Use database transactions for data integrity

### Rust
- Use `Result<T, E>` for error handling
- Implement proper error types with `thiserror`
- Use `?` operator for error propagation
- Handle async errors properly

### Rust
- Use `Result<T, E>` for error handling
- Implement proper error types with `thiserror`
- Use `?` operator for error propagation
- Handle async errors properly

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Sanitize outputs to prevent XSS
- Use HTTPS in production
- Implement proper authentication and authorization

## Git Workflow

- Create feature branches from main
- Write descriptive commit messages
- Run tests before committing
- Use pull requests for code review
- Keep commits small and focused

## Development Tips

- Use browser DevTools for frontend debugging
- Check Laravel logs (`storage/logs/laravel.log`)
- Use `dd()` or `dump()` for Laravel debugging
- Test API endpoints with Postman or curl
- Keep code DRY (Don't Repeat Yourself)
- Follow SOLID principles

## Environment Setup

### Frontend
- Node.js 18+ required
- Install dependencies with `npm install`
- Copy `.env.example` to `.env` if needed

### Auth Service (Python)
- Python 3.8+ required
- pip for dependency management
- Configure `.env` file for database
- PostgreSQL recommended for production

### Laravel
- PHP 8.2+ required
- Composer for dependency management
- Configure `.env` file for database
- Run `php artisan key:generate`

### Rust
- Rust 1.70+ required
- Cargo for dependency management
- Configure `.env` file for database
- PostgreSQL required for SQLx queries

## Common Issues

- CORS errors: Check proxy configuration in `vite.config.js`
- Database connection: Verify `.env` settings
- Authentication: Check JWT token handling
- Docker issues: Check container logs with `docker-compose logs`

## Import Guidelines

### Frontend
```javascript
// Vue imports first
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Third-party libraries
import axios from 'axios'

// Local imports
import { useAuthStore } from '../stores/auth'
import Header from '../components/Header.vue'
```

### Auth Service (Python)
```python
# Standard library imports first
import os
from typing import List, Optional

# Third-party imports
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

# Local imports
from .models import User
from .schemas import UserCreate
from .database import get_db
```

### Laravel
```php
// Laravel classes first
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Application classes
use App\Models\Product;
use App\Http\Controllers\Controller;
```