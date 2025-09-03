'use client';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getStripe from '@/lib/stripe';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleStripeCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart after successful payment
    clearCart();
    
    // Redirect to success page
    router.push('/checkout/success');
    setIsProcessing(false);
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white dark:text-gray-100 mb-3 flex items-center justify-center gap-3">
            <span>💳</span>
            Checkout
          </h1>
          <p className="text-white/80 dark:text-gray-300">
            Complete your purchase securely with Stripe
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg">
            <p className="text-red-800 dark:text-red-400">⚠️ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100">{item.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payment Method</h2>
            
            <div className="space-y-4 mb-6">
              {/* Stripe Checkout Option */}
              <div className="p-4 border-2 border-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">💳 Secure Payment with Stripe</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Pay securely with your credit card, debit card, or digital wallet through Stripe's secure checkout.
                </p>
                <button
                  onClick={handleStripeCheckout}
                  disabled={isProcessing}
                  className="btn-primary w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Pay ${getTotalPrice().toFixed(2)} with Stripe</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Demo Option */}
              <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">🎮 Demo Mode</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Try the checkout flow without real payment processing.
                </p>
                <button
                  onClick={handleDemoCheckout}
                  disabled={isProcessing}
                  className="btn-secondary w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Processing Demo...
                    </div>
                  ) : (
                    `Demo Checkout ($${getTotalPrice().toFixed(2)})`
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="btn-ghost-light w-full"
            >
              ← Back to Cart
            </button>

            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p>Powered by Stripe - industry-leading payment security</p>
              <p>SSL encrypted and PCI DSS compliant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}