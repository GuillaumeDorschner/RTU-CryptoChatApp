import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';

const ToggleDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  return (
    <button onClick={toggleTheme} className="px-2">
      {isDarkMode ? <FontAwesomeIcon icon={faSun} color="white" /> : <FontAwesomeIcon icon={faMoon} color="black" />}
    </button>
  );
};

export default ToggleDarkMode;
