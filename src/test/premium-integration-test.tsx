/**
 * Premium Integration Test
 * 
 * This file serves as a manual test reference for the premium subscription system.
 * Run this test by temporarily importing it into your Dashboard or any component to verify functionality.
 */

import React from 'react';
import { useSubscription, usePremiumAccess, useSubscriptionTier } from "@/hooks/use-subscription";
import { PremiumBadge, UpgradePrompt, FeatureGate, TrialBanner } from "@/components/premium/PremiumComponents";

export function PremiumIntegrationTest() {
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { hasPremium, isPremium, isFree, isLoading: premiumLoading } = usePremiumAccess();
  const { tier, isTrialActive, trialDaysLeft } = useSubscriptionTier();

  if (subscriptionLoading || premiumLoading) {
    return <div>Loading subscription data...</div>;
  }

  return (
    <div className="p-6 space-y-6 border rounded-lg bg-card">
      <h2 className="text-2xl font-bold">Premium Integration Test</h2>
      
      {/* Subscription Status */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Subscription Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Tier: <span className="font-medium">{tier}</span></div>
          <div>Status: <span className="font-medium">{subscription?.status || 'unknown'}</span></div>
          <div>Has Premium: <span className="font-medium">{hasPremium ? 'Yes' : 'No'}</span></div>
          <div>Is Premium: <span className="font-medium">{isPremium ? 'Yes' : 'No'}</span></div>
          <div>Is Free: <span className="font-medium">{isFree ? 'Yes' : 'No'}</span></div>
          <div>Trial Active: <span className="font-medium">{isTrialActive ? 'Yes' : 'No'}</span></div>
          {isTrialActive && <div>Trial Days Left: <span className="font-medium">{trialDaysLeft}</span></div>}
        </div>
      </div>

      {/* Raw Subscription Data */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Raw Subscription Data</h3>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
          {JSON.stringify(subscription, null, 2)}
        </pre>
      </div>

      {/* Premium Components Test */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Premium Components</h3>
        
        {/* Premium Badge */}
        <div>
          <h4 className="font-medium mb-2">Premium Badge:</h4>
          <PremiumBadge tier={tier} />
        </div>

        {/* Trial Banner */}
        <div>
          <h4 className="font-medium mb-2">Trial Banner:</h4>
          <TrialBanner />
        </div>

        {/* Upgrade Prompt */}
        <div>
          <h4 className="font-medium mb-2">Upgrade Prompt:</h4>
          <UpgradePrompt feature="advanced analytics" />
        </div>

        {/* Feature Gate */}
        <div>
          <h4 className="font-medium mb-2">Feature Gate (Premium Required):</h4>
          <FeatureGate requiresPremium={true}>
            <div className="p-3 bg-green-100 rounded text-green-800">
              🎉 This premium feature is unlocked!
            </div>
          </FeatureGate>
        </div>

        <div>
          <h4 className="font-medium mb-2">Feature Gate (Pro Required):</h4>
          <FeatureGate requiresPro={true}>
            <div className="p-3 bg-blue-100 rounded text-blue-800">
              🚀 This pro feature is unlocked!
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage Instructions:
 * 
 * 1. Import this component into your Dashboard.tsx:
 *    import { PremiumIntegrationTest } from "@/test/premium-integration-test";
 * 
 * 2. Add it temporarily to your dashboard render:
 *    <PremiumIntegrationTest />
 * 
 * 3. Test different subscription states by:
 *    - Creating test users with different tiers in your database
 *    - Using Convex dashboard to modify user subscription data
 *    - Testing the subscription management functions
 * 
 * 4. Verify:
 *    - Premium badges show correct tier
 *    - Feature gates work properly
 *    - Trial banner appears for trial users
 *    - Upgrade prompts show for free users
 *    - Subscription hooks return correct data
 */