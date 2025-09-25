/**
 * Temporary Template Seeding Component
 * 
 * Add this to your Dashboard to easily seed templates during testing.
 * Remove after testing is complete.
 */

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Loader2, Check, Database } from "lucide-react";

export function TemplateSeedButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const seedTemplates = useMutation(api.workoutTemplates.seedPreBuiltTemplates);

  const handleSeed = async () => {
    setStatus('loading');
    try {
      const result = await seedTemplates({});
      console.log('Seeding result:', result);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Seeding error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Seeding Templates...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="h-4 w-4 mr-2 text-green-600" />
            Templates Seeded!
          </>
        );
      case 'error':
        return (
          <>
            <Database className="h-4 w-4 mr-2 text-red-600" />
            Error - Try Again
          </>
        );
      default:
        return (
          <>
            <Database className="h-4 w-4 mr-2" />
            Seed Templates
          </>
        );
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={status === 'loading'}
      variant={status === 'success' ? 'default' : 'outline'}
      size="sm"
      className="mb-4"
    >
      {getButtonContent()}
    </Button>
  );
}

export default TemplateSeedButton;