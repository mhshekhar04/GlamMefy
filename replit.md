# StyleMe Hair Styling App

## Overview

StyleMe is a modern, interactive hair styling web application that allows users to scan their face and try different hairstyles and colors using AI technology. The app features a premium user interface with smooth animations, comprehensive style galleries, and an engaging user experience. Built as a full-stack application with React frontend and Express backend, it provides real-time hair styling visualization and personalized recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for component-based UI development
- **Styling**: Tailwind CSS with custom design system variables and gradients
- **UI Components**: Radix UI components with shadcn/ui for consistent, accessible interface elements
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Development**: Hot module replacement with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solutions
- **Database**: PostgreSQL as primary database with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Shared schema definitions between frontend and backend
- **Validation**: Zod schemas for runtime type validation and API contract enforcement

### Core Data Models
- **Users**: Authentication, premium status, and user preferences
- **Hairstyles**: Style catalog with categories, difficulty levels, and trending flags
- **User Styles**: Personal style history, favorites, and color customizations

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Authentication**: Traditional username/password authentication
- **Premium Features**: Role-based access control for advanced styling features

### Frontend Features Architecture
- **Face Scanning**: Interactive modal with camera access and file upload capabilities
- **Style Gallery**: Filterable grid with search, categories, and trending styles
- **Color Palette**: Comprehensive color selection with natural and vibrant options
- **Preview System**: Before/after comparison with interactive slider controls
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Development Environment
- **Monorepo Structure**: Shared code between client and server with TypeScript path mapping
- **Hot Reload**: Full-stack development with Vite integration
- **Code Quality**: ESLint and TypeScript strict mode for code consistency
- **Asset Management**: Vite-based asset optimization and bundling

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants and styling

### State Management and Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form handling with validation and error management

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Media and File Handling
- **Unsplash**: Stock photography for hairstyle previews and examples
- **Browser APIs**: Camera access via getUserMedia for face scanning functionality

### Deployment and Runtime
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **ESBuild**: Production bundling for server-side code