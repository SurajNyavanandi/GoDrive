# 🚀 Frontend Developer Guide & Ecosystem Cheat-Sheet

This guide provides an exhaustive list of performance best practices, hook optimization rules, and the **top recommended libraries and free-tier services** for every common frontend feature. Keep this handy so your team never wastes time researching which library to pick.

---

## ⚡ 1. Essential Commands

| Task | Command | Description |
|---|---|---|
| **Start Development** | `npm run dev` | Starts server on `http://localhost:3000` with instant Vite HMR. |
| **Build for Production** | `npm run build` | Compiles optimized static assets into `frontend/dist/`. |
| **Start Production Server** | `npm start` | Runs full-stack server serving the compiled frontend bundle. |

---

## 🎯 2. Performance & Hook Optimization Rules

### A. `useMemo` — When to Use
- **Use for:** Expensive computations (filtering/sorting 500+ items, math transforms) or stabilizing object/array references passed to memoized children or hook dependency arrays.
- **Example:**
  ```javascript
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  }, [users, query]);
  ```
- **Avoid:** Do not memoize simple primitive assignments (e.g. `useMemo(() => a + b, [a, b])`). The hook overhead is higher than the math.

### B. `useCallback` — When to Use
- **Use for:** Passing callback functions as props to child components wrapped in `React.memo` or passing functions into `useEffect` dependency arrays.
- **Example:**
  ```javascript
  const handleItemSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);
  ```

### C. `useRef` — When to Use
- **Use for:**
  1. Storing mutable values that should **not** trigger a re-render when mutated (timer IDs, previous state snapshots, debounce flags).
  2. Directly accessing DOM elements (focusing inputs, auto-scrolling containers, Canvas/Video elements).
- **Example:**
  ```javascript
  const timerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  ```

### D. Data Fetching & Caching (TanStack Query)
- Pre-configured with `staleTime: 5 * 60 * 1000` (5-minute cache).
- Prevents redundant network requests on tab switching or component remounts.
- **Example:**
  ```javascript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import api from '../services/api';

  // Read Query
  export const useItems = () =>
    useQuery({
      queryKey: ['items'],
      queryFn: async () => (await api.get('/items')).data.data.items,
    });

  // Write Mutation
  export const useCreateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (newItem) => api.post('/items', newItem),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
  };
  ```

---

## 📦 3. Curated Best-in-Class Libraries (By Category)

Save hours of research by using these industry-standard packages when adding new features:

### 1. State Management
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **Zustand** | Global App State | Super lightweight (1kB), zero boilerplate, no provider wrappers needed. | `npm i zustand` |
| **Jotai** | Atomic State | Granular atom-based state (perfect for complex forms/canvases). | `npm i jotai` |

### 2. Animations & Transitions
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **Framer Motion (`motion`)** | UI Animations & Gestures | Industry gold-standard for smooth enter/exit and layout animations. | `npm i motion` |
| **@formkit/auto-animate** | Zero-config List Animations | Adds smooth animations to lists and grids with a single hook line. | `npm i @formkit/auto-animate` |
| **Canvas Confetti** | Celebrations & Milestones | Lightweight particle physics for payment and registration wins. | *(Pre-installed)* |

### 3. Charts & Data Visualization
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **Recharts** | Business & SaaS Dashboards | Declarative, built specifically for React, highly responsive. | `npm i recharts` |
| **Chart.js + react-chartjs-2** | Canvas High-Performance Charts | Handles thousands of real-time data points smoothly. | `npm i chart.js react-chartjs-2` |

### 4. Tables & Advanced Data Grids
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **TanStack Table (v8)** | Complex Grids & Filters | Headless, supports virtualized rendering, sorting, filtering, and pagination. | `npm i @tanstack/react-table` |

### 5. Rich Text & Markdown Editors
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **Tiptap** | Modern WYSIWYG Editor | Extensible, Notion/Medium-style editor powered by ProseMirror. | `npm i @tiptap/react @tiptap/starter-kit` |
| **react-markdown** | Markdown Rendering | Safely renders Markdown to HTML with GitHub Flavored Markdown support. | `npm i react-markdown remark-gfm` |

### 6. Drag and Drop
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **@dnd-kit/core** | Kanban, Sortable Lists | Modern, accessible, smooth touch/pointer support. | `npm i @dnd-kit/core @dnd-kit/sortable` |

### 7. PDF Generation & Export
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **@react-pdf/renderer** | Generating PDF Invoices/Docs | Build PDFs directly using declarative React components. | `npm i @react-pdf/renderer` |
| **jsPDF + html2canvas** | Export DOM to PDF | Takes existing HTML elements and saves them as downloadable PDFs. | `npm i jspdf html2canvas` |

### 8. Date & Time Helpers
| Library | Best For | Why Choose It | Install Command |
|---|---|---|---|
| **date-fns** | Date Formatting & Relative Time | Modular, tree-shakeable alternative to Moment.js. | *(Pre-installed)* |

---

## 🎁 4. Top Free UI Assets & Tooling

1. **Icons**: [Lucide React](https://lucide.dev) (Pre-installed — 1,000+ clean SVGs).
2. **Toasts**: [Sonner](https://sonner.emilkowal.ski) (Pre-installed — super lightweight and accessible).
3. **Illustrations**: [unDraw.co](https://undraw.co) (Free customizable SVGs for landing pages).
4. **Mock Stock Photos**: [Unsplash Source](https://images.unsplash.com) (High-res royalty-free placeholder images).
