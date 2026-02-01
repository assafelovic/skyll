# Skyll Landing Page

Next.js 16 + Tailwind CSS v4 landing page for [Skyll](https://skyll.app).

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

**Note**: The backend API must be running on port 8000:

```bash
# From the project root
uvicorn src.main:app --port 8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

For production, set this to your deployed API (e.g., `https://api.skyll.app`).

## Deployment

### Vercel (Recommended)

1. Import the repository on [vercel.com](https://vercel.com)
2. Set root directory to `web/landing`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://api.skyll.app`
4. Deploy!

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **Tailwind CSS v4** with PostCSS
- **Framer Motion** for animations
- **Lucide React** for icons
- **JetBrains Mono** font
