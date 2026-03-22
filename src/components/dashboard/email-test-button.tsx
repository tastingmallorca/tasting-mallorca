'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { sendTestEmail } from '@/app/server-actions/email/sendTestEmail';

export function EmailTestButton() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const result = await sendTestEmail({});
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Email Delivery Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Email Dispatched',
          description: result.data?.message || 'Queued in Firestore.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Exception thrown',
        description: err.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button 
      onClick={handleSendTest} 
      disabled={isSending} 
      variant="outline"
      className="mt-4 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
    >
      {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
      Run Email Diagnostics (Trigger Mail Extension)
    </Button>
  );
}
