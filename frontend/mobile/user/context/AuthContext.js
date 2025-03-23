import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { ToastAndroid } from 'react-native';
import base64 from 'base-64';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái xác thực khi ứng dụng khởi động
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Kiểm tra token có hợp lệ không bằng cách giải mã JWT
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Giải mã token để kiểm tra thời gian hết hạn
      // Đoạn này giả định token có định dạng JWT chuẩn
      const base64Url = token.split('.')[1];
      const base64String = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(base64.decode(base64String));
      
      // Kiểm tra thời gian hết hạn
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        console.log("Token đã hết hạn");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Lỗi khi kiểm tra token:", error);
      return false;
    }
  };

  const checkLoginStatus = async () => {
    try {
      console.log("AuthContext - Đang kiểm tra trạng thái đăng nhập");
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');
      
      console.log("AuthContext - Kiểm tra token:", token ? "Có token" : "Không có token");
      
      if (token) {
        setAccessToken(token);
        
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            console.log("AuthContext - Đã tải thông tin người dùng:", parsedUserData.name || parsedUserData.email);
          } catch (e) {
            console.error("AuthContext - Lỗi khi phân tích dữ liệu người dùng:", e);
          }
        }
        
        // Đặt isAuthenticated sau khi xác nhận có token
        setIsAuthenticated(true);
        console.log("AuthContext - Đã đăng nhập với token:", token.substring(0, 10) + "...");
        return token; // Trả về token để sử dụng trong các context khác
      } else {
        // Nếu không có token, đảm bảo trạng thái là đăng xuất
        setIsAuthenticated(false);
        setUser(null);
        console.log("AuthContext - Chưa đăng nhập, không tìm thấy token");
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập
  const login = async (token, userData) => {
    try {
      console.log('Đang lưu token và dữ liệu người dùng...');
      
      if (!token) {
        console.error('Không thể đăng nhập: Thiếu token');
        ToastAndroid.show('Lỗi khi đăng nhập: Thiếu token', ToastAndroid.SHORT);
        return false;
      }
      
      // Lưu token và thông tin người dùng
      await AsyncStorage.setItem('accessToken', token);
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Cập nhật state
      setAccessToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log("Đăng nhập thành công, đã lưu token:", token.substring(0, 10) + "...");
      ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT);
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu thông tin đăng nhập:', error);
      ToastAndroid.show('Lỗi khi đăng nhập', ToastAndroid.SHORT);
      return false;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      console.log("Đang xóa thông tin đăng nhập...");
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userData');
      
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log("Đăng xuất thành công, đã xóa token");
      ToastAndroid.show('Đã đăng xuất', ToastAndroid.SHORT);
      return true;
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      ToastAndroid.show('Lỗi khi đăng xuất', ToastAndroid.SHORT);
      return false;
    }
  };

  // Kiểm tra token có hợp lệ không bằng cách gọi API
  const validateToken = async () => {
    const token = await getStoredToken();
    if (!token) return false;
    
    try {
      console.log('Đang xác thực token với server...');
      const response = await fetch(`${API_URL}/user/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        console.log('Server xác nhận token hợp lệ');
        return true;
      } else {
        // Token không hợp lệ, đăng xuất
        console.log('Server xác nhận token không hợp lệ, tự động đăng xuất');
        ToastAndroid.show('Phiên đăng nhập đã hết hạn', ToastAndroid.SHORT);
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi xác thực token với server:', error);
      return false;
    }
  };

  // Debug token
  const getStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        console.log('Token hiện tại trong AsyncStorage:', token.substring(0, 10) + "...");
      } else {
        console.log('Không có token trong AsyncStorage');
      }
      return token;
    } catch (error) {
      console.error('Lỗi khi lấy token từ AsyncStorage:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        user,
        loading,
        login,
        logout,
        checkLoginStatus,
        validateToken,
        getStoredToken,
        isTokenValid
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 