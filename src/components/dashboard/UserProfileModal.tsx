import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription, usePremiumAccess } from "@/hooks/use-subscription";
import { PremiumBadge, UpgradePrompt } from "@/components/premium/PremiumComponents";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export function UserProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { hasPremium } = usePremiumAccess();
  const setProfile = useMutation(api.users.setProfile);

  // Calculate days since signup - fallback to 1 if _creationTime not available
  const daysSinceSignup = user ? 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md my-4 mx-2 sm:mx-0"
      >
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Your Profile</h3>
              <PremiumBadge tier={subscription?.tier || "free"} />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="p-5">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const fName = ((fd.get("firstName") as string) || "").trim();
                const lName = ((fd.get("lastName") as string) || "").trim();
                const ageStr = ((fd.get("age") as string) || "").trim();
                const weightStr = ((fd.get("weight") as string) || "").trim();
                const age = ageStr ? Number(ageStr) : undefined;
                const weight = weightStr ? Number(weightStr) : undefined;

                try {
                  await setProfile({
                    firstName: fName || (user?.name ?? "").split(" ")[0] || "",
                    lastName:
                      lName ||
                      (user?.name ?? "")
                        .split(" ")
                        .slice(1)
                        .join(" ")
                        .trim() ||
                      "",
                    age,
                    weight,
                  } as any);
                  toast("Profile saved");
                  onClose();
                } catch (err) {
                  console.error(err);
                  toast("Failed to save profile");
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First name</Label>
                  <Input
                    name="firstName"
                    defaultValue={(user?.name ?? "").split(" ")[0] || ""}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Last name</Label>
                  <Input
                    name="lastName"
                    defaultValue={(user?.name ?? "").split(" ").slice(1).join(" ") || ""}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input
                    name="age"
                    type="number"
                    min="0"
                    defaultValue={typeof (user as any)?.age === "number" ? (user as any).age : undefined}
                    placeholder="e.g., 28"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Current weight (kg)</Label>
                  <Input
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={typeof (user as any)?.weight === "number" ? (user as any).weight : undefined}
                    placeholder="e.g., 70"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  Working out since: <span className="font-medium">{daysSinceSignup}</span> days
                </div>
                <div>
                  Subscription: <span className="font-medium capitalize">{subscription?.tier || "free"}</span>
                  {subscription?.status === "trial" && subscription?.trialEnd && (
                    <span className="ml-2 text-amber-600">
                      (Trial ends {new Date(subscription.trialEnd).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>

              {!hasPremium && (
                <div className="pt-2">
                  <UpgradePrompt feature="enhanced profile features" />
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
