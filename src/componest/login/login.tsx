import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/login/authActions";
import type { AppDispatch } from '../../store';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  dispatch(login(username, password));
};
  return (
    <div className="flex justify-center items-center min-h-screen ">
      <form 
        onSubmit={handleLogin} 
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Welcome
        </h2>
        
        <div className="mb-5">
          <label htmlFor="username" className="block text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
          disabled={auth.loading}
        >
          {auth.loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : "Login"}
        </button>

        <div className="mt-6 text-center">
          {auth.error && (
            <p className="text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-100">
              {auth.error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginForm;