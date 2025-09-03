'use client';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const itemCount = getTotalItems();

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <button
      onClick={handleCartClick}
      className="btn-ghost p-2 rounded-lg relative"
      aria-label={`Shopping cart with ${itemCount} items`}
      title="View shopping cart"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}