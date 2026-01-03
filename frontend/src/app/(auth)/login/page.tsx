"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authApi.login(formData.email, formData.password);
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Store auth data using zustand store
      login(user, accessToken, refreshToken);
      
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.error?.message || "Invalid credentials";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-black p-4">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] group-hover:scale-105 transition-transform">
            <Dumbbell className="h-7 w-7 text-black" />
          </div>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#121212] rounded-lg p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
          Log in to JERAI
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-white">
              Email or username
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email or username"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full h-12 px-4 rounded-md bg-[#121212] border border-[#727272] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-white focus:ring-2 focus:ring-white transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-white">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full h-12 px-4 pr-12 rounded-md bg-[#121212] border border-[#727272] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-white focus:ring-2 focus:ring-white transition-all"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="remember"
              checked={formData.remember}
              onChange={(e) =>
                setFormData({ ...formData, remember: e.target.checked })
              }
              className="w-4 h-4 rounded bg-[#121212] border-[#727272] text-[#1db954] focus:ring-[#1db954] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-white cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-4 rounded-full bg-[#1db954] text-black font-bold text-base hover:bg-[#1ed760] hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-8 text-center">
          <Link
            href="/forgot-password"
            className="text-white underline hover:text-[#1db954] transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-[#282828]" />

        {/* Sign Up Link */}
        <p className="text-center text-[#a7a7a7]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white underline hover:text-[#1db954] transition-colors">
            Sign up for JERAI
          </Link>
        </p>
      </div>

      {/* Footer Stats */}
      <div className="mt-12 flex items-center gap-8 text-center">
        <div>
          <p className="text-2xl font-bold text-[#1db954]">1000+</p>
          <p className="text-xs text-[#a7a7a7]">Active Members</p>
        </div>
        <div className="h-8 w-px bg-[#282828]" />
        <div>
          <p className="text-2xl font-bold text-[#1db954]">50+</p>
          <p className="text-xs text-[#a7a7a7]">Daily Classes</p>
        </div>
        <div className="h-8 w-px bg-[#282828]" />
        <div>
          <p className="text-2xl font-bold text-[#1db954]">98%</p>
          <p className="text-xs text-[#a7a7a7]">Satisfaction</p>
        </div>
      </div>
    </div>
  );
}
