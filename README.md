# Rehi Web

**Rehi** is an AI-powered knowledge management platform designed to help you read, highlight, and remember information effectively. It combines article saving, intelligent highlighting, AI-powered chat, and spaced repetition flashcards to transform how you learn and retain knowledge.

## Key Features

- **Article Management**: Save articles from the web using browser extension or web app
- **Smart Highlighting**: Highlight important content with color coding and notes
- **AI-Powered Chat**: Ask questions about your saved articles or get general assistance
- **Flashcard Learning**: Automatically generate flashcards from highlights for spaced repetition
- **Tag Organization**: Organize articles with custom tags
- **Reading Experience**: Customize fonts, sizes, and reading preferences
- **Advanced Search**: Filter articles by tags, authors, and content with boolean operators
- **Cross-Device Sync**: Access your knowledge library from any device

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Auth0 account (for authentication)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rehi-web
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file with your Auth0 credentials:

```
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='your-auth0-domain'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

For comprehensive user guide and feature documentation, see:

- **[User Guide](/guide)** - Complete guide to all Rehi features and how to use them
- **USER_GUIDE.md** - Markdown version of the user guide

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie)
- **Authentication**: Auth0
- **Markdown Rendering**: react-markdown
- **Date Handling**: dayjs

## Development

### Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── (main)/      # Authenticated pages with sidebar
│   ├── (article-details)/  # Article detail pages
│   └── chat/        # Chat page
├── components/      # React components
├── db/              # IndexedDB setup and repositories
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API clients
├── services/        # Business logic services
└── store/           # Zustand stores
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Extension

Rehi also includes a browser extension for saving articles directly from the web. The extension syncs with the web application for a seamless experience.

**Quick Guide:**

1. Install the extension from Chrome Web Store
2. Pin the extension and login
3. Press **Alt + R** on any article to save it
4. Highlights created in the extension sync automatically with the web app

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [USER_GUIDE.md](./USER_GUIDE.md) - Markdown user guide

## License

Private - All rights reserved
