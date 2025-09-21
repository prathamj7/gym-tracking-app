import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const setName = useMutation(api.users.setName);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const f = (formData.get("firstName") as string) || "";
      const l = (formData.get("lastName") as string) || "";
      setFirstName(f);
      setLastName(l);

      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      if (firstName.trim() || lastName.trim()) {
        try {
          await setName({
            firstName: firstName.trim() || "",
            lastName: lastName.trim() || "",
          });
        } catch (e) {
          console.warn("Failed to set user name:", e);
        }
      }

      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-6">
      {/* Center container */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="max-w-md w-full bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center">
                  <img
                    src="./ashu_anime_gym.png"
                    alt="Gym Logo"
                    width={72}
                    height={72}
                    className="rounded-lg mb-4 cursor-pointer"
                    onClick={() => navigate("/")}
                  />
                </div>
                <CardTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Get Started
                </CardTitle>
                <CardDescription className="text-indigo-200 mt-2">
                  Enter your email to log in
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit} className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <Label htmlFor="firstName" className="font-semibold">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-semibold">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="relative flex items-center gap-2">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-indigo-300" />
                  <Input
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    className="pl-10"
                    disabled={isLoading}
                    required
                    aria-label="Email address"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    disabled={isLoading}
                    aria-label="Send verification code"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
                )}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest text-white/50">
                      Or
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 text-white"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-5 w-5" />
                    Continue as Guest
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center pt-6 pb-4">
                <CardTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Check your email
                </CardTitle>
                <CardDescription className="text-indigo-200 mt-2">
                  We've sent a code to <strong>{(step as { email: string }).email}</strong>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit} className="px-6 pb-6">
                <input type="hidden" name="email" value={(step as { email: string }).email} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center mb-4">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        form?.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
                )}
                <p className="text-xs text-white/60 text-center mb-6">
                  Didn't receive a code?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-white underline"
                    onClick={() => setStep("signIn")}
                  >
                    Try again
                  </Button>
                </p>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition-transform font-bold text-white"
                    disabled={isLoading || otp.length !== 6}
                    aria-label="Verify OTP code"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify code
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full font-semibold text-white"
                  >
                    Use different email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
          <div className="py-4 px-6 text-xs text-center text-white/50 bg-white/10 border-t border-white/20 rounded-b-lg">
            Secured by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pink-400"
            >
              vly.ai
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
