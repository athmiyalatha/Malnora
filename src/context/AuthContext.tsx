import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

type User = {
  name: string;
  email: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = '@malnora_users';
const CURRENT_USER_KEY = '@malnora_current_user';

type StoredUser = User & {
  password: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('Failed to load current user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const savedUsers = await AsyncStorage.getItem(USERS_KEY);
      const users: StoredUser[] = savedUsers ? JSON.parse(savedUsers) : [];

      const foundUser = users.find(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!foundUser) {
        return false;
      }

      const loggedInUser: User = {
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
      };

      await AsyncStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      return true;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    try {
      const savedUsers = await AsyncStorage.getItem(USERS_KEY);
      const users: StoredUser[] = savedUsers ? JSON.parse(savedUsers) : [];

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = users.find(
        (item) => item.email.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        return false;
      }

      const newUser: StoredUser = {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
      };

      const updatedUsers = [...users, newUser];

      await AsyncStorage.setItem(
        USERS_KEY,
        JSON.stringify(updatedUsers)
      );

      const loggedInUser: User = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      };

      await AsyncStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      return true;
    } catch (error) {
      console.log('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}