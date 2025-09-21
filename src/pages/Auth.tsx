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
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });
        } catch {}
      }
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch {
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
      setError(
        error instanceof Error ? error.message : "Failed to login as guest."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6">
      <div className="flex-grow flex items-center justify-center">
        <Card className="max-w-md w-full bg-black/70 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg text-center">
          {step === "signIn" ? (
            <>
              <CardHeader className="pt-8 px-6 pb-2">
                <img
                  src="./ashu_anime_gym.png"
                  alt="Gym Logo"
                  className="mx-auto mb-6 rounded-lg cursor-pointer"
                  width={72}
                  height={72}
                  onClick={() => navigate("/")}
                />
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Get Started
                </CardTitle>
                <CardDescription className="text-indigo-300 mt-1">
                  Enter your email to log in
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleEmailSubmit} className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                      disabled={isLoading}
                      required
                      className="bg-black bg-opacity-30 border border-white/20 placeholder:text-white/40 text-white"
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
                      disabled={isLoading}
                      required
                      className="bg-black bg-opacity-30 border border-white/20 placeholder:text-white/40 text-white"
                    />
                  </div>
                </div>

                <div className="relative flex items-center gap-2">
                  <Mail className="absolute left-3 top-3 text-white/50" />
                  <Input
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    disabled={isLoading}
                    required
                    className="pl-10 bg-black bg-opacity-30 border border-white/20 placeholder:text-white/40 text-white"
                    aria-label="Email address"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading}
                    aria-label="Send verification code"
                    className="hover:bg-white/10"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {error && (
                  <p className="mt-4 text-red-500 text-center">{error}</p>
                )}

                <div className="mt-8">
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-white/20"></div>
                    <span className="mx-4 text-white/50 uppercase text-xs tracking-widest">
                      Or
                    </span>
                    <div className="flex-grow border-t border-white/20"></div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="mt-6 bg-white/10 hover:bg-white/20 text-white w-full font-semibold"
                  >
                    <UserX className="inline-block mr-2" />
                    Continue as Guest
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="pt-10 px-6 pb-4">
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Check your email
                </CardTitle>
                <CardDescription className="text-indigo-300 mt-1">
                  A login code was sent to <strong>{(step as {email: string}).email}</strong>
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleOtpSubmit} className="px-6 pb-6">
                <input
                  type="hidden"
                  name="email"
                  value={(step as { email: string }).email}
                />
                <input type="hidden" name="code" value={otp} />
                <div className="mb-6 flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    aria-label="Enter one-time password"
                    className="border-none bg-transparent placeholder-white"
                  >
                    <InputOTPGroup>
                      {Array(6)
                        .fill(null)
                        .map((_, idx) => (
                          <InputOTPSlot key={idx} index={idx} />
                        ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="mb-4 text-red-500 text-center">{error}</p>
                )}

                <div className="mb-6 text-center text-sm text-white/50">
                  Didn't receive the code?{" "}
                  <Button
                    variant="link"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="p-0 underline text-white"
                  >
                    Send again
                  </Button>
                </div>

                <CardFooter className="flex flex-col space-y-3">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105 transition-transform"
                    disabled={isLoading || otp.length !== 6}
                    aria-label="Verify code"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline-block" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify
                        <ArrowRight className="inline-block ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="bg-transparent text-white hover:underline"
                  >
                    Change email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          <div className="mt-10 px-6 py-4 bg-white/10 rounded-b-lg text-center text-xs text-white/50 select-none">
            Powered by <a href="https://vly.ai" target="_blank" className="underline hover:text-pink-500">vly.ai</a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: any) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
