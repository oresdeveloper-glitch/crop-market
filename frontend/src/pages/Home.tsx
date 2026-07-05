import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  if (user) {
    const route = user.role === "FARMER" ? "/farmer" : user.role === "BUYER" ? "/buyer" : "/admin";
    return <Navigate to={route} replace />;
  }

  return (
    <div className="min-h-[85vh] flex flex-col">
      <div className="relative overflow-hidden rounded-3xl mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 hero-gradient opacity-85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-navy-900/30" />

        <div className="relative px-8 py-24 sm:px-16 sm:py-32 text-center">
          <div className="animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium mb-6 ring-1 ring-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              IoT-Powered Platform
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Crop quality<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-teal-200">
              meets the market
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto mb-10 animate-fade-in-up animate-delay-100">
            Real-time IoT quality assessment connecting farmers and buyers
            in a transparent digital marketplace.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up animate-delay-200">
            <Link
              to="/register"
              className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
        {[
          { icon: "🌿", title: "IoT Sensors", desc: "Real-time crop monitoring with ESP32 sensors", color: "from-green-500 to-emerald-600", delay: "" },
          { icon: "📊", title: "Quality Grades", desc: "AI-powered A/B/C quality assessment", color: "from-teal-500 to-cyan-600", delay: "animate-delay-100" },
          { icon: "🤝", title: "Marketplace", desc: "Direct farmer-to-buyer digital marketplace", color: "from-primary-500 to-green-600", delay: "animate-delay-200" },
        ].map((item) => (
          <div
            key={item.title}
            className={`group relative overflow-hidden rounded-2xl p-6 bg-white/70 dark:bg-navy-800/70 backdrop-blur-sm border border-navy-100/60 dark:border-navy-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up ${item.delay}`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${item.color} mix-blend-soft-light`} />
            <div className="relative">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-navy-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-navy-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
