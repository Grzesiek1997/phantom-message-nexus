# Phantom Message Nexus

A secure messaging application built with React, TypeScript, and Supabase.

## Features

- End-to-end encryption
- Real-time messaging
- Contact management
- User authentication
- Security features

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Testing

The project uses Vitest for testing. To run tests:

```
npm test
```

To run tests with coverage:

```
npm run test:coverage
```

Current test coverage focuses on utility functions in the `src/utils` directory:
- `typeGuards.ts` - Type guard functions for better type safety (100% coverage)
- `contactHelpers.ts` - Helper functions for contact management (100% coverage)
- `storyHelpers.ts` - Helper functions for story management (100% coverage)
- `quantumSecurity.ts` - Quantum-enhanced security utilities (76% coverage)
- `encryption.ts` - Client-side encryption utilities (partial coverage)

## Building

To build the project for production:

```
npm run build
```

## License

[MIT](LICENSE)
