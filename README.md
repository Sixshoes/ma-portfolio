# Prof. Yuan-Ron Ma - Academic Portfolio

A high-performance, visually immersive academic portfolio website for Prof. Yuan-Ron Ma (Y.R. Ma), Vice President and Distinguished Professor, specializing in Advanced Materials & Quantum Devices.

## 🌟 Features

* **Quantum Aesthetic:** A high-tech, immersive UI inspired by quantum physics and nanotechnology.
* **Bilingual Support:** Full support for English and Traditional Chinese (繁體中文) with smooth transitions.
* **Dynamic Stats:** Real-time visualization of research impact (Publications, Citations, Patents, Experience).
* **Responsive Design:** Optimized for all devices, from mobile to ultra-wide desktops.
* **Interactive Research Interests:** Interactive cards showcasing core research areas like 1D Nanomaterials, 2D Magnetic Materials, and Electrochromism.
* **Automated Publication List:** Fetches and filters publication data from external sources (GitHub Pages/JSON).
* **Smooth Animations:** Powered by motion/react (Framer Motion) for fluid, professional transitions.
* **Performance Optimized:** Built with Next.js 15+ and Tailwind CSS v4 for lightning-fast load times.

## 🛠️ Tech Stack

* **Framework:** Next.js 15+ (App Router)
* **Styling:** Tailwind CSS v4
* **Animations:** motion/react
* **Icons:** Lucide React
* **Typography:** Inter, Outfit, JetBrains Mono (via Google Fonts)
* **Smooth Scrolling:** Lenis

## 🚀 Getting Started

### Prerequisites
* Node.js 18.17 or later
* npm or yarn

### Installation
Clone the repository:
```bash
git clone <repository-url>
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
Open http://localhost:3000 with your browser to see the result.

## 📁 Project Structure

* `app/`: Next.js App Router directory.
  * `main/page.tsx`: The primary portfolio content.
  * `page.tsx`: Immersive landing/entry page.
  * `LanguageContext.tsx`: Global state for bilingual support.
  * `globals.css`: Tailwind CSS imports and global styles.
* `components/`: Reusable UI components.
* `public/`: Static assets (images, icons).

## 📊 Data Sources

* **Citations & Publications:** Sourced from Scopus & ORCID.
* **Rankings & Metrics:** Sourced from AD Scientific Index.
* **Publication List:** Dynamically loaded from `https://sixshoes.github.io/Ma-Research-Portal/papers.json`.

## 📄 License & Copyright

* **Source Code:** Available under the [MIT License](LICENSE).
* **Content:** All personal images, academic history, and textual content are Copyright © 2026 Yuan-Ron Ma (Y.R. Ma) • Advanced Materials & Quantum Devices Laboratory. All Rights Reserved.

## 👨‍💻 Developer / Maintainer

* **Yiting Chen (Allen)** - Fo Guang University Office of Sustainability
