'use client';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';  
      case 'hard': return '🔴';
      default: return '🟢';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just navigate to a checkout page
    // In Phase 3, this will integrate with Stripe
    router.push('/checkout');
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-white dark:text-gray-100 mb-4">Your Cart is Empty</h1>
            <p className="text-white/80 dark:text-gray-300 mb-8">
              Discover amazing quizzes and add them to your cart to get started!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/browse')}
                className="btn-primary"
              >
                Browse Quizzes
              </button>
              <button
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white dark:text-gray-100 mb-3 flex items-center justify-center gap-3">
            <span>🛒</span>
            Shopping Cart
          </h1>
          <p className="text-white/80 dark:text-gray-300">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Quiz Details */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                        <span className="mr-1">{getDifficultyIcon(item.difficulty)}</span>
                        {item.difficulty}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        🌐 {item.language}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        📝 {item.questionsCount} questions
                      </span>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Qty:</label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-gray-800 dark:text-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    aria-label="Remove from cart"
                    title="Remove from cart"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm underline transition-colors"
              >
                Clear entire cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Taxes</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn-primary w-full mb-4"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Proceed to Checkout ($${getTotalPrice().toFixed(2)})`
                )}
              </button>

              <button
                onClick={() => router.push('/browse')}
                className="btn-secondary w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}