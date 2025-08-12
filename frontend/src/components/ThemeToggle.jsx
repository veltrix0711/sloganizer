import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-200 hover:bg-space/50 dark:hover:bg-space/50 hover:bg-gray-100"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-orange" />
      ) : (
        <Moon className="h-5 w-5 text-night" />
      )}
    </button>
  )
}

export default ThemeToggle