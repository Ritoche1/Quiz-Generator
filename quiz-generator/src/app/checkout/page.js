'use client';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
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
            Complete your purchase securely
          </p>
        </div>

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

          {/* Payment Form */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Payment Information</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Information
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="form-input"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Full name on card"
                  className="form-input"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay $${getTotalPrice().toFixed(2)}`
                )}
              </button>

              <button
                onClick={() => router.back()}
                className="btn-secondary w-full"
              >
                Back to Cart
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p className="mt-1">This is a demo checkout - no real payments will be processed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}