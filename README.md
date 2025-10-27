# 📝 Todo List Application - Serverless Version

A modern, serverless todo list application built with React, Vite, and Tailwind CSS. All data is stored locally in your browser using localStorage, making it completely private and requiring no backend server.

## ✨ Features

### 📋 Task Management
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Set priority levels (Low, Medium, High)
- Add due dates to tasks
- Search and filter tasks
- View task statistics

### 📓 Notes Section
- Create and organize personal notes
- Categorize notes for better organization
- Search through notes
- Rich text formatting support

### 🍳 Recipe Manager
- Store your favorite recipes
- Track ingredients and instructions
- Calculate nutrition information
- Adjust serving sizes dynamically
- Categorize recipes (Breakfast, Lunch, Dinner, Snack)

### 🔐 Authentication
- Local authentication system
- User registration and login
- Secure password storage in localStorage
- Persistent login sessions

### 🎨 UI/UX Features
- Beautiful, modern interface with Tailwind CSS
- Dark mode support
- Smooth animations with Framer Motion
- Fully responsive design
- Modal forms with proper centering

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd "TO-DO LIST"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Using the start script (Windows)
Double-click `start.bat` or run:
```bash
start.bat
```

#### Option 2: Using npm
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the next available port).

## 🏗️ Build for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
TO-DO LIST/
├── src/
│   ├── components/       # Reusable components
│   │   ├── TodoSection.jsx
│   │   ├── TodoItem.jsx
│   │   ├── TodoForm.jsx
│   │   ├── NotesSection.jsx
│   │   ├── RecipesSection.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── DashboardNew.jsx
│   ├── services/        # API and storage services
│   │   ├── api.js
│   │   └── localStorage.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## 💾 Data Storage

This application uses browser localStorage for data persistence:
- All data is stored locally in your browser
- No external server or database required
- Data persists between sessions
- Completely private - your data never leaves your device

### Data Structure
- **Users**: User accounts and authentication
- **Todos**: Task items with priorities and due dates
- **Notes**: Personal notes with categories
- **Recipes**: Recipe collection with nutrition info

## 🎯 Usage

### First Time Setup
1. Open the application
2. Click "Sign up" to create a new account
3. Enter a username and password
4. Start adding tasks, notes, and recipes!

### Daily Use
1. Login with your credentials
2. Navigate between sections using the tab bar:
   - **Tasks**: Manage your todo items
   - **Notes**: Create and organize notes
   - **Recipes**: Store and manage recipes
3. Use the search and filter options to find items quickly
4. Toggle dark mode using the sun/moon icon

## 🔧 Configuration

### Environment Variables
Create a `.env` file for custom configuration (optional):
```env
VITE_APP_NAME=My Todo App
```

### Customization
- Colors and theme: Edit `tailwind.config.js`
- Styles: Modify `src/index.css`
- Components: Update files in `src/components/`

## 🚀 Deployment

This serverless application can be deployed to any static hosting service:

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Vercel
1. Connect your repository to Vercel
2. It will automatically build and deploy

### GitHub Pages
1. Build the project
2. Deploy the `dist` folder to GitHub Pages

## 🛠️ Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Icons** - Icon library
- **date-fns** - Date formatting
- **uuid** - Unique ID generation
- **localStorage** - Data persistence

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📧 Support

For issues or questions, please create an issue in the repository.

---

Made with ❤️ using React and Tailwind CSS
