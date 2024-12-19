import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { useChatContext } from "../context/ChatContext";

const ToggleDarkMode = () => {
  const { settings, setSettings } = useChatContext();

  const toggleTheme = () => {
    const newTheme = settings?.theme === "dark" ? "light" : "dark";
    setSettings({
      ...settings,
      theme: newTheme,
      open: settings?.open ?? false,
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      settings?.theme || "light",
    );
  }, [settings]);

  return (
    <button onClick={toggleTheme} className="px-2">
      {settings?.theme === "dark" ? (
        <FontAwesomeIcon icon={faSun} color="white" />
      ) : (
        <FontAwesomeIcon icon={faMoon} color="black" />
      )}
    </button>
  );
};

export default ToggleDarkMode;
