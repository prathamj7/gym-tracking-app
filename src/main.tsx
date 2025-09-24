import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import ClerkAuth from "@/pages/ClerkAuth.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

// Apply dark theme
document.documentElement.classList.add("dark");

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

function ClerkConvexProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  
  return (
    <ConvexProviderWithClerk 
      client={convex} 
      useAuth={() => getToken({ template: "convex" })}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          baseTheme: 'dark',
          variables: {
            colorPrimary: 'hsl(var(--primary))',
            colorBackground: 'hsl(var(--background))',
            colorInputBackground: 'hsl(var(--muted))',
            colorInputText: 'hsl(var(--foreground))',
          }
        }}
      >
        <ClerkConvexProvider>
          <BrowserRouter>
            <RouteSyncer />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/*" element={<ClerkAuth redirectAfterAuth="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ClerkConvexProvider>
      </ClerkProvider>
    </InstrumentationProvider>
  </StrictMode>,
);