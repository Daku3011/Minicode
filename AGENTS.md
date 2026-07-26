# AGENTS.md

## Build & Run Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Services
```bash
docker compose up -d redis postgres
```

### Load Testing
```bash
node load_test.js
```

## Test Commands

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Lint Commands

### Backend
```bash
cd backend
ruff check .
ruff format .
```

### Frontend
```bash
cd frontend
npm run lint
npm run typecheck
```

## Code Style Guidelines

### Python (Backend)
- Use type hints for all function parameters and return values
- Follow PEP 8 style guidelines
- Use async/await for async operations
- Prefer `asyncio` over `threading` for concurrency
- Use `pydantic` models for data validation
- Keep functions focused and single-purpose
- Use meaningful variable and function names
- Add docstrings for complex functions

### TypeScript (Frontend)
- Use strict TypeScript configuration
- Prefer functional components with hooks
- Use async/await for asynchronous operations
- Follow Next.js conventions for routing and data fetching
- Use proper error boundaries
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names

### General
- Follow existing code patterns in the project
- Keep code DRY (Don't Repeat Yourself)
- Write self-documenting code with clear naming
- Avoid premature optimization
- Handle errors appropriately at each layer

## Architecture Overview

### High-Level Architecture
- **Monorepo Structure**: Backend and frontend in separate directories
- **Backend**: FastAPI (Python) with SQLite database
- **Frontend**: Next.js 15+ with TypeScript
- **Services**: Redis for caching, PostgreSQL available via Docker
- **Communication**: REST API between frontend and backend

### Backend Components
- **FastAPI Application**: Main API server with async endpoints
- **Database Layer**: SQLite for persistent storage (users, questions, executions, jobs)
- **Background Worker**: Job execution system using asyncio tasks
- **Session Management**: JWT-based authentication with tokens
- **Rate Limiting**: In-memory rate limiting per IP

### Frontend Components
- **Next.js App**: Server-side rendering and static generation
- **Code Editor**: Monaco Editor integration for code editing
- **Real-time Execution**: WebSocket or polling for code execution results
- **State Management**: React hooks for local state
- **UI Components**: Responsive design with mobile-first approach

### Data Flow
1. User authenticates via frontend → backend JWT flow
2. Questions fetched from backend API
3. Code submitted to backend → job created
4. Background worker executes code in sandboxed environment
5. Results returned to frontend via polling or WebSocket

## Testing Patterns

### Backend Testing
- Use `pytest` for unit and integration tests
- Test API endpoints with `TestClient`
- Mock external dependencies where appropriate
- Test database operations with test fixtures
- Verify error handling and edge cases

### Frontend Testing
- Use React Testing Library for component tests
- Test user interactions and form submissions
- Verify responsive behavior across screen sizes
- Mock API calls for isolated testing
- Test error states and loading states

### Integration Testing
- Test full user flows from frontend to backend
- Verify API contract between frontend and backend
- Test authentication and authorization flows
- Verify code execution pipeline end-to-end

## Common Tasks

### Adding a New API Endpoint
1. Define request/response models in `pydantic`
2. Implement route handler in `main.py`
3. Add database operations if needed
4. Write tests for the new endpoint
5. Update API documentation if necessary

### Adding a New Frontend Component
1. Create component in `components/` directory
2. Add proper TypeScript types
3. Implement responsive design
4. Add accessibility attributes
5. Write component tests if complex

### Modifying Database Schema
1. Update SQLite schema in `main.py`
2. Create migration script if needed
3. Update affected API endpoints
4. Test data migration for existing users
5. Update documentation

## Security Considerations

- Never expose sensitive credentials in code
- Use environment variables for configuration
- Validate all user inputs at API boundaries
- Implement proper CORS configuration
- Use secure session management (JWT with appropriate expiry)
- Rate limit API endpoints to prevent abuse
- Sanitize user-generated content

## Performance Guidelines

- Use async operations for I/O-bound tasks
- Implement proper caching strategies
- Optimize database queries with indexes
- Use connection pooling where appropriate
- Monitor and log performance metrics
- Consider lazy loading for frontend components

## Deployment

### Production Considerations
- Use Gunicorn with Uvicorn workers for backend
- Configure proper logging and monitoring
- Set up database backups for SQLite
- Use HTTPS for all communications
- Configure rate limiting and security headers
- Set up health check endpoints

### Docker
- Use multi-stage builds for smaller images
- Configure proper health checks
- Use non-root users for security
- Set up proper volume mounts for persistence

## Troubleshooting

### Common Issues
- **Database locked**: Ensure only one writer at a time for SQLite
- **CORS errors**: Verify backend CORS configuration matches frontend origin
- **Rate limiting**: Check in-memory rate limiter state
- **Worker not processing**: Verify background worker is running
- **Frontend build errors**: Check TypeScript types and imports

### Debugging Tips
- Use backend logs for API issues
- Check browser developer tools for frontend issues
- Verify database state with SQLite browser
- Monitor Redis for caching issues
- Check Docker container logs for service issues