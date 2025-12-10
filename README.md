# 🏗️ AutoCAD Drafter AI

## *Transform a single photo into complete technical blueprints*

[![Made with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📖 About

**AutoCAD Drafter AI** is an intelligent web application that transforms a single photo into complete technical blueprints. Using Google Gemini 2.5 Flash, it automatically generates all four canonical orthographic projections (Front, Top, Back, Side) in strict CAD-style rendering.

Perfect for engineers, designers, and 3D modelers who need rapid prototyping, technical documentation, or educational materials.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **Smart Orientation Detection** | Automatically identifies whether your image is Front, Side, Top, or Back view |
| 🔄 **Complete Projection Set** | Generates all 4 canonical orthographic views from a single input |
| 🎯 **Technical Precision** | Blueprint-style rendering with CAD-inspired aesthetics |
| 🌙 **Dark Mode UI** | High-contrast, cyberpunk-inspired interface for comfortable viewing |
| 📦 **Batch Export** | Download all generated views as a single `.zip` archive |
| ⌨️ **Keyboard Navigation** | Full-screen gallery with arrow key controls |
| ⚡ **Real-time Processing** | Watch as AI generates each view in sequence |

---

## 🛠️ Tech Stack

```text
Frontend     → React 19 + TypeScript + Vite
Styling      → Tailwind CSS
AI Engine    → Google Gemini 2.5 Flash (Vision + Image Generation)
Icons        → Lucide React
Utilities    → JSZip, base64 encoding
```

### AI Models Used

- **`gemini-2.5-flash`** → Vision analysis & logic reasoning
- **`gemini-2.5-flash-image`** → Technical drawing generation

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one free](https://ai.google.dev/))

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/autocad-drafter-ai.git
cd autocad-drafter-ai
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API key:

```env
VITE_API_KEY=AIzaSyYourActualApiKeyHere12345
```

> **Note:** The `VITE_` prefix is required for Vite to expose the variable to the browser. Get your key from [Google AI Studio](https://aistudio.google.com/apikey).

#### 4. Start the development server

```bash
npm run dev
```

#### 5. Open in browser

Navigate to [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## 📖 Usage Guide

### 1. Upload an image

Click "Upload Source Image" and select a photo (PNG/JPG). Works best with clear, well-lit objects on plain backgrounds.

### 2. Wait for AI generation

The system analyzes orientation and generates 4 orthographic views sequentially. This takes 30-60 seconds.

### 3. Inspect and navigate

Click any card for full-screen view. Use `←` `→` arrow keys to navigate, `ESC` to exit.

### 4. Download results

Click `DOWNLOAD_ARCHIVE` to save all views as high-res PNGs in a `.zip` file.

---

## 🏗️ Project Structure

```text
autocad-drafter-ai/
├── src/
│   ├── components/        # React components
│   ├── services/          # Gemini API integration
│   │   └── geminiService.ts
│   ├── types/             # TypeScript interfaces
│   ├── constants/         # System prompts & config
│   └── App.tsx            # Main application
├── public/                # Static assets
├── .env.local            # Environment variables (you create this)
└── vite.config.ts        # Vite configuration
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🐛 Troubleshooting

### Error: "An API Key must be set when running in a browser"

#### Solution

1. Check that `.env.local` exists in the root directory
2. Verify the variable is named `VITE_API_KEY` (with `VITE_` prefix)
3. Restart the dev server after creating/modifying `.env.local`

### Images not generating

#### Possible causes

- Invalid or expired API key
- API quota exceeded ([check usage](https://aistudio.google.com/))
- Image format not supported (use PNG/JPG)
- Network connectivity issues

### TypeScript errors

Run:

```bash
npm run build
```

This will show all type errors. Most common issues are missing dependencies or outdated `@types` packages.

---

## 🎨 Customization

### Modify Blueprint Style

Edit the system prompt in `src/constants/index.ts` to adjust:

- Line thickness and style
- Grid patterns
- Annotation format
- Perspective rules

### Change AI Models

In `src/services/geminiService.ts`, you can swap models:

```typescript
model: "gemini-2.5-flash"        // Fast, efficient
model: "gemini-2.5-pro"          // More accurate (slower)
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

### Guidelines

- Follow the existing code style
- Add TypeScript types for all functions
- Test with multiple image types before submitting
- Update README if adding new features

---

## 📄 License

This project is open-source and available under the **MIT License**.

```text
Copyright (c) 2025 AutoCAD Drafter AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

See [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **React Team** for the amazing framework
- **Tailwind CSS** for rapid UI development
- **Vite** for lightning-fast dev experience

---

## 📬 Contact & Support

- 🐛 **Report bugs:** [GitHub Issues](https://github.com/your-username/autocad-drafter-ai/issues)
- 💡 **Feature requests:** [GitHub Discussions](https://github.com/your-username/autocad-drafter-ai/discussions)
- 📧 **Email:** <your-email@example.com>

---

Built with ❤️ by engineers, for engineers

⭐ Star this repo if you find it useful!
