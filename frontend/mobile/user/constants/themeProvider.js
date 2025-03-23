import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import Colors from './Colors';

// Tạo context cho theme
const ThemeContext = createContext();

// Hook để sử dụng theme trong các component khác
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }) => {
  // Lấy theme từ hệ thống
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');

  // Hàm để chuyển đổi theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Giá trị và hàm sẽ được cung cấp cho các component con
  const value = {
    theme,
    toggleTheme,
    colors: theme === 'dark' ? Colors.dark : Colors.light,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 