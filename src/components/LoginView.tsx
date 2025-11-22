
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const Logo = theme.logo;
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve form validation and an API call.
    // For this simulation, we'll just log the user in.
    onLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-500">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className={`mx-auto mb-4 w-16 h-16 text-primary-600`} />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {mode === 'login' ? theme.appName : 'Create an Account'}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
             {mode === 'login' ? 'Access your personal library.' : 'Begin your reading journey with us.'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                </div>
              )}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Email" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder={mode === 'login' ? "6-digit PIN" : "Create a 6-digit PIN"} required maxLength={6} pattern="\d{6}" inputMode="numeric" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
              </div>
              <button type="submit" className={`w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg`}>
                {mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className={`font-semibold text-primary-600 hover:underline`}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google icon" className="h-6 w-auto" />
              <span>Continue with Google</span>
            </button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>A seamless reading experience awaits.</p>
      </footer>
    </div>
  );
};

export default LoginView;
