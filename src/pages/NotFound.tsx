import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const NotFound = () => {
  const location = useLocation();
  const animatedNum = useCountUp(404, 800);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <div className="relative inline-block mb-6">
          <span className="text-8xl font-bold text-primary animate-fadeInUp">{animatedNum}</span>
        </div>
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-float">
          <HelpCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 animate-fadeInUp" style={{ animationDelay: '400ms', animationFillMode: 'both', opacity: 0 }}>
          Page not found
        </h2>
        <p className="mb-6 text-muted-foreground animate-fadeInUp" style={{ animationDelay: '600ms', animationFillMode: 'both', opacity: 0 }}>
          This page doesn't exist in GutSense
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] animate-popIn"
          style={{ animationDelay: '800ms', animationFillMode: 'both', opacity: 0 }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
