'use client';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
    dictionary: {
        confirmAndPay: string;
        goBack: string;
        stripeRefundPolicy?: string;
    };
    handlePrevStep: () => void;
    returnUrl: string;
}


export default function CheckoutForm({ dictionary, handlePrevStep, returnUrl }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message || 'An unexpected error occurred.');
       toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message || 'An unexpected error occurred.',
      });
    } else {
      setMessage('An unexpected error occurred.');
       toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: "Please try again later.",
      });
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement id="payment-element" />
        <div className="space-y-3">
            {dictionary.stripeRefundPolicy && (
                <p className="text-xs text-muted-foreground text-center mb-4 leading-tight">
                    {dictionary.stripeRefundPolicy}
                </p>
            )}
            <Button disabled={isLoading || !stripe || !elements} id="submit" size="lg" className="w-full font-bold text-lg py-7 bg-accent text-primary-foreground hover:bg-accent/90">
                <span id="button-text">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : dictionary.confirmAndPay}
                </span>
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={handlePrevStep} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {dictionary.goBack}
            </Button>
        </div>

        {message && <div id="payment-message" className="text-destructive text-sm text-center">{message}</div>}
    </form>
  );
}
