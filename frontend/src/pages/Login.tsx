import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === "FARMER" ? "/farmer" : user.role === "BUYER" ? "/buyer" : "/admin");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-xl font-semibold text-navy-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-navy-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm px-3 py-2.5 rounded-xl ring-1 ring-red-200/50 dark:ring-red-800/30">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field" placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
          <p className="text-center text-xs text-navy-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
