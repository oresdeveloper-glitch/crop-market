import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "FARMER" });
  const [error, setError] = useState("");
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === "FARMER" ? "/farmer" : "/buyer");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email && !form.phone) {
      setError("Email or phone is required");
      return;
    }
    try {
      await register({
        fullName: form.fullName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-amber-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-primary-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-xl font-semibold text-navy-900 dark:text-white">Create account</h1>
          <p className="text-sm text-navy-400 mt-1">Join the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm px-3 py-2.5 rounded-xl ring-1 ring-red-200/50">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Full name</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field" placeholder="John Kamau" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="+255 7XX XXX" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field" placeholder="At least 6 characters" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, role: "FARMER" })}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  form.role === "FARMER"
                    ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300 shadow-sm"
                    : "border-navy-200 text-navy-500 hover:border-navy-300 dark:border-navy-700 dark:text-navy-400"
                }`}>
                🌱 Farmer
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: "BUYER" })}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  form.role === "BUYER"
                    ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300 shadow-sm"
                    : "border-navy-200 text-navy-500 hover:border-navy-300 dark:border-navy-700 dark:text-navy-400"
                }`}>
                🏪 Buyer
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create account</button>
          <p className="text-center text-xs text-navy-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
