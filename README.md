# Jon Harris - Portfolio Website

A modern, responsive portfolio website built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern React** with hooks and functional components
- **Tailwind CSS** for utility-first styling
- **Vite** for lightning-fast development and builds
- **Responsive Design** optimized for all devices
- **Smooth Animations** including typing effect and counter animations
- **Lucide Icons** for consistent iconography
- **GitHub Pages** deployment ready

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   └── Counter.jsx      # Animated counter component
├── hooks/              # Custom React hooks
│   └── useTypewriter.js # Typewriter effect hook
├── assets/             # Static assets
├── App.jsx             # Main portfolio component
├── main.jsx            # React entry point
└── index.css           # Global styles & Tailwind imports
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development URLs

- **Development**: http://localhost:5173/
- **Production Preview**: http://localhost:4173/

## 🚀 Deployment

This project is configured for GitHub Pages deployment:

1. Build the project: `npm run build`
2. Commit and push to your repository
3. Enable GitHub Pages in repository settings
4. Set source to deploy from `main` branch `/dist` folder

## 📝 Customization

### Personal Information

Update personal details in `src/App.jsx`:

- Contact information
- Social media links
- Project descriptions
- Skills and experience

### Styling

- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component-specific styles: Inline with Tailwind classes

### Content

- Projects section: Update the projects array in `App.jsx`
- About section: Modify the about content
- Skills: Update the skills array

## 🎨 Design Features

- **Dark theme** with green accent colors
- **Smooth scrolling** navigation
- **Mobile-first** responsive design
- **Loading animations** and micro-interactions
- **Professional typography** with proper hierarchy

## 📧 Contact

- Email: jonra.harris@gmail.com
- GitHub: [@jraharris89](https://github.com/jraharris89)
- LinkedIn: [jon-harris001](https://linkedin.com/in/jon-harris001/)
- Website: [jonharris.dev](https://jonharris.dev)

---

Built with ❤️ using modern web technologies

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
