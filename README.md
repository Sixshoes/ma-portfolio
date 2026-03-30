# Prof. Yuan-Ron Ma - Academic Portfolio

A high-performance, visually immersive academic portfolio website for **Prof. Yuan-Ron Ma (Y.R. Ma)**, Vice President and Distinguished Professor, specializing in **Advanced Materials & Quantum Devices**.

## 🌟 Features

- **Quantum Aesthetic**: A high-tech, immersive UI inspired by quantum physics and nanotechnology.
- **Bilingual Support**: Full support for English and Traditional Chinese (繁體中文) with smooth transitions.
- **Dynamic Stats**: Real-time visualization of research impact (Publications, Citations, Patents, Experience).
- **Responsive Design**: Optimized for all devices, from mobile to ultra-wide desktops.
- **Interactive Research Interests**: Interactive cards showcasing core research areas like 1D Nanomaterials, 2D Magnetic Materials, and Electrochromism.
- **Automated Publication List**: Fetches and filters publication data from external sources (GitHub Pages/JSON).
- **Smooth Animations**: Powered by `motion/react` (Framer Motion) for fluid, professional transitions.
- **Performance Optimized**: Built with Next.js 15+ and Tailwind CSS v4 for lightning-fast load times.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [motion/react](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Inter, Space Grotesk, JetBrains Mono (via Google Fonts)
- **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/`: Next.js App Router directory.
  - `main/page.tsx`: The primary portfolio content.
  - `page.tsx`: Immersive landing/entry page.
  - `LanguageContext.tsx`: Global state for bilingual support.
  - `globals.css`: Tailwind CSS imports and global styles.
- `components/`: Reusable UI components.
- `public/`: Static assets (images, icons).

## 📊 Data Sources

- **Citations & Publications**: Sourced from Scopus & ORCID.
- **Publication List**: Dynamically loaded from `https://sixshoes.github.io/Ma-Research-Portal/papers.json`.

## 📄 License

This project is private and intended for academic portfolio use.

---

© 2026 Yuan-Ron Ma (Y.R. Ma) • Advanced Materials & Quantum Devices Laboratory
