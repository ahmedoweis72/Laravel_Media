# Modern Web Application

A modern web application built with cutting-edge technologies, featuring a responsive design, dark mode support, and a robust component system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)

## 📋 Requirements

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+, Fedora 32+)
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Disk Space**: At least 1GB of free space

### Software Requirements

- **Node.js**: Version 18.0.0 or higher
  ```bash
  # Verify Node.js version
  node --version
  ```
- **npm**: Version 8.0.0 or higher (comes with Node.js)
  ```bash
  # Verify npm version
  npm --version
  ```
- **Git**: Latest version recommended
  ```bash
  # Verify Git version
  git --version
  ```

## 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone git@github.com:ahmedoweis72/Laravel_Media.git
   cd Laravel_Media
   ```

2. **Install Dependencies**
   ```bash
   # Install project dependencies
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Open .env and configure your environment variables
   nano .env
   ```

4. **Development Server**
   ```bash
   # Start the development server
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📦 Available Scripts

```bash
# Development
npm run dev         # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm test          # Run tests
```

## 🏗️ Project Structure

```
├── public/                 # Static files
├── src/
│   ├── components/        # React components
│   ├── pages/            # Application pages
│   ├── styles/           # Global styles and themes
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── resources/
│   └── css/             # CSS and Tailwind configuration
├── tests/                # Test files
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
└── README.md            # Project documentation
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
API_URL=http://localhost:8000
```

### Tailwind Configuration

The project uses a custom Tailwind CSS theme with both light and dark mode support. Configuration can be found in:
- `resources/css/app.css` - Theme variables and custom utilities
- `tailwind.config.js` - Tailwind configuration

## 🔧 Troubleshooting

### Common Issues

1. **Node.js version mismatch**
   ```bash
   # Solution: Use nvm to install the correct version
   nvm install 18
   nvm use 18
   ```

2. **Port already in use**
   ```bash
   # Solution: Kill the process using the port
   sudo lsof -i :3000
   kill -9 <PID>
   ```

3. **Dependencies issues**
   ```bash
   # Solution: Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 Code Style Guide

- Use ESLint and Prettier configurations provided
- Follow component naming conventions
- Write meaningful commit messages
- Add appropriate documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📮 Support

For support, please:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue if needed

---
Made with ❤️ by Ahmed Ramadan
