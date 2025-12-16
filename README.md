# Attenda - Event Guest Management System

A modern event management application built with Clean Architecture principles, Next.js, and Supabase.

## 🚀 Features

- **Event Management** - Create and manage events with multiple gates
- **Guest Lists** - Upload and manage guest lists with QR codes
- **RSVP System** - Allow guests to RSVP online
- **Check-in System** - QR code-based guest check-ins
- **Multi-Gate Support** - Support multiple entry points per event

## 🔒 Security & Git

### ✅ Safe to Commit
- Source code, tests, documentation
- Schema files (supabase/schema.sql)
- Example env file (.env.local.example)

### ❌ Never Commit
- .env.local (Contains Supabase credentials!)
- .env files with real secrets
- .supabase/ directory

The .gitignore is already configured to protect these files.

## 📚 Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup instructions.

## 🧪 Testing

\`\`\`bash
pnpm test              # Run all tests (39 passing ✅)
pnpm test:supabase     # Test Supabase connection
\`\`\`

## 🚧 Status

✅ Entities & Use Cases | ✅ Supabase Auth | ✅ Tests | 🚧 Repositories | 📋 API | 📋 UI
