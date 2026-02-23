# SmartKart 2.0 - Frontend

A high-performance, responsive React application built with Vite and TypeScript.

## 💻 Tech Stack

- **Library**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📂 Architecture

The frontend follows a feature-based folder structure inside `src/`:

- `components/`: Reusable UI components (Buttons, Modals, Inputs).
- `features/`: Logic for specific domains (auth, products, cart). Includes API calls and Redux slices.
- `pages/`: Page-level components associated with routes.
- `routes/`: Router configuration and layout definitions.
- `app/`: Global providers and the centralized Redux store.

## 🛠 Notable Features

- **Dynamic Routing**: Role-based route protection for Consumers and Shopkeepers.
- **Optimistic Updates**: Using TanStack Query for a snappy UI experience.
- **Persisted State**: Auth state and cart data persistence.
- **Responsive Layouts**: Mobile-first design using Tailwind CSS.

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checker
npm run typecheck

# Build for production
npm run build
```

## 📡 API Integration

Communication with the backend is handled via a centralized axios instance with interceptors for automatic token handling and error processing.
