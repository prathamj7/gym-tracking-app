import { Crown, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionTier } from "@/hooks/use-subscription";

// Premium badge component
export function PremiumBadge({ 
  tier, 
  className = "" 
}: { 
  tier?: "free" | "premium" | "pro"; 
  className?: string;
}) {
  if (!tier || tier === "free") return null;

  const config = {
    premium: {
      icon: Sparkles,
      label: "Premium",
      variant: "default" as const,
      className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
    },
    pro: {
      icon: Crown,
      label: "Pro",
      variant: "default" as const,
      className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"
    }
  };

  const { icon: Icon, label, className: badgeClassName } = config[tier];

  return (
    <Badge className={`${badgeClassName} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

// Upgrade prompt component
export function UpgradePrompt({
  feature,
  description,
  className = "",
  compact = false
}: {
  feature: string;
  description?: string;
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 ${className}`}>
        <Zap className="w-4 h-4 text-purple-500" />
        <span className="text-sm text-muted-foreground">
          <span className="text-purple-500 font-medium">{feature}</span> requires premium
        </span>
        <Button size="sm" variant="outline" className="ml-auto text-xs">
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border-purple-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Unlock {feature}</CardTitle>
            <CardDescription>
              {description || `${feature} is available with premium subscription`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
}

// Feature gate component
export function FeatureGate({
  children,
  fallback,
  requiresPremium = false,
  requiresPro = false,
  showUpgrade = true
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresPremium?: boolean;
  requiresPro?: boolean;
  showUpgrade?: boolean;
}) {
  const { tier, isLoading } = useSubscriptionTier();

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded h-8 w-24" />;
  }

  const hasAccess = 
    (!requiresPremium && !requiresPro) || // No requirements
    (requiresPremium && (tier === "premium" || tier === "pro")) || // Premium access
    (requiresPro && tier === "pro"); // Pro access

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    const requiredTier = requiresPro ? "Pro" : "Premium";
    return (
      <UpgradePrompt 
        feature={`${requiredTier} Feature`}
        description={`This feature requires ${requiredTier} subscription`}
        compact
      />
    );
  }

  return null;
}

// Trial banner component
export function TrialBanner() {
  const { tier, isTrialActive, trialDaysLeft } = useSubscriptionTier();

  if (!isTrialActive || tier !== "premium") return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <div>
            <p className="font-medium text-sm">Premium Trial Active</p>
            <p className="text-xs text-muted-foreground">
              {trialDaysLeft} days remaining
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}

// Subscription status indicator
export function SubscriptionStatus() {
  const { tier, isLoading } = useSubscriptionTier();

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded h-6 w-16" />;
  }

  return (
    <div className="flex items-center gap-2">
      <PremiumBadge tier={tier} />
      {tier === "free" && (
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
          Free Plan
        </Button>
      )}
    </div>
  );
}