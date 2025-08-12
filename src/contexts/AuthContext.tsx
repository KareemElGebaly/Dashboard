import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, otp?: string) => Promise<{ success: boolean; needsOTP?: boolean; message?: string }>;
  logout: () => void;
  sendOTP: (email: string) => Promise<boolean>;
  inviteUser: (email: string, name: string) => Promise<boolean>;
  getInvitedUsers: () => User[];
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const ADMIN_EMAIL = 'kareem@letsvape.ae';

// Simulate OTP generation and email sending
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const simulateEmailSend = (email: string, otp: string): Promise<{ success: boolean; otp: string }> => {
  return new Promise((resolve) => {
    // Simulate email sending delay
    setTimeout(() => {
      console.log(`📧 OTP sent to ${email}: ${otp}`);
      // In a real app, this would send an actual email
      resolve({ success: true, otp });
    }, 1000);
  });
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      });
    }
  }, []);

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      // Check if it's admin or invited user
      const users = JSON.parse(localStorage.getItem('invitedUsers') || '[]');
      const isInvitedUser = users.find((u: User) => u.email === email);
      
      if (email !== ADMIN_EMAIL && !isInvitedUser) {
        return false;
      }

      const otp = generateOTP();
      const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Store OTP temporarily
      localStorage.setItem('pendingOTP', JSON.stringify({
        email,
        otp,
        expiryTime
      }));

      const result = await simulateEmailSend(email, otp);
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  };

  const login = async (email: string, otp?: string): Promise<{ success: boolean; needsOTP?: boolean; message?: string }> => {
    try {
      // Check if it's admin or invited user
      const users = JSON.parse(localStorage.getItem('invitedUsers') || '[]');
      const invitedUser = users.find((u: User) => u.email === email);
      
      if (email === ADMIN_EMAIL) {
        if (!otp) {
          // First step: request OTP
          const otpSent = await sendOTP(email);
          if (otpSent) {
            return { success: false, needsOTP: true, message: 'OTP sent to your email' };
          } else {
            return { success: false, message: 'Failed to send OTP' };
          }
        } else {
          // Second step: verify OTP
          const pendingOTPData = localStorage.getItem('pendingOTP');
          if (!pendingOTPData) {
            return { success: false, message: 'No OTP request found' };
          }

          const { otp: storedOTP, expiryTime, email: otpEmail } = JSON.parse(pendingOTPData);
          
          if (otpEmail !== email) {
            return { success: false, message: 'OTP email mismatch' };
          }
          
          if (Date.now() > expiryTime) {
            localStorage.removeItem('pendingOTP');
            return { success: false, message: 'OTP expired' };
          }

          if (otp !== storedOTP) {
            return { success: false, message: 'Invalid OTP' };
          }

          // OTP verified, login admin
          const adminUser: User = {
            id: 'admin',
            email: ADMIN_EMAIL,
            name: 'Administrator',
            role: 'admin',
            createdAt: new Date().toISOString(),
          };

          setAuthState({
            user: adminUser,
            isAuthenticated: true,
            isAdmin: true,
          });

          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          localStorage.removeItem('pendingOTP');
          
          return { success: true };
        }
      } else if (invitedUser) {
        // Invited user login with OTP
        if (!otp) {
          // First step: request OTP
          const otpSent = await sendOTP(email);
          if (otpSent) {
            return { success: false, needsOTP: true, message: 'OTP sent to your email' };
          } else {
            return { success: false, message: 'Failed to send OTP' };
          }
        } else {
          // Second step: verify OTP
          const pendingOTPData = localStorage.getItem('pendingOTP');
          if (!pendingOTPData) {
            return { success: false, message: 'No OTP request found' };
          }

          const { otp: storedOTP, expiryTime, email: otpEmail } = JSON.parse(pendingOTPData);
          
          if (otpEmail !== email) {
            return { success: false, message: 'OTP email mismatch' };
          }
          
          if (Date.now() > expiryTime) {
            localStorage.removeItem('pendingOTP');
            return { success: false, message: 'OTP expired' };
          }

          if (otp !== storedOTP) {
            return { success: false, message: 'Invalid OTP' };
          }

          // OTP verified, login invited user
          setAuthState({
            user: invitedUser,
            isAuthenticated: true,
            isAdmin: false,
          });

          localStorage.setItem('currentUser', JSON.stringify(invitedUser));
          localStorage.removeItem('pendingOTP');
          
          return { success: true };
        }
      } else {
        // User not found
          return { success: false, message: 'User not found or not invited' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const inviteUser = async (email: string, name: string): Promise<boolean> => {
    try {
      if (!authState.isAdmin) {
        return false;
      }

      const users = JSON.parse(localStorage.getItem('invitedUsers') || '[]');
      
      // Check if user already exists
      if (users.find((u: User) => u.email === email)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        invitedBy: authState.user?.id,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('invitedUsers', JSON.stringify(users));
      
      // In a real app, this would send an invitation email
      console.log(`📧 Invitation sent to ${email}`);
      
      return true;
    } catch (error) {
      console.error('Invite user error:', error);
      return false;
    }
  };

  const getInvitedUsers = (): User[] => {
    return JSON.parse(localStorage.getItem('invitedUsers') || '[]');
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      if (!authState.isAdmin) {
        return false;
      }

      const users = JSON.parse(localStorage.getItem('invitedUsers') || '[]');
      const updatedUsers = users.filter((u: User) => u.id !== userId);
      localStorage.setItem('invitedUsers', JSON.stringify(updatedUsers));
      
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('pendingOTP');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      sendOTP,
      inviteUser,
      getInvitedUsers,
      deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};