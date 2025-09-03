'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getTotalItems: () => 0,
      getTotalPrice: () => 0
    };
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('quizCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        setItems(cartData);
      } catch (error) {
        console.error('Failed to parse cart data:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('quizCart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (quiz, price = 9.99) => {
    const existingItem = items.find(item => item.id === quiz.id);
    
    if (existingItem) {
      // If item already in cart, increase quantity
      setItems(prev => prev.map(item => 
        item.id === quiz.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item to cart
      const cartItem = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || 'No description available',
        difficulty: quiz.difficulty || 'medium',
        language: quiz.language || 'English',
        questionsCount: quiz.questionsCount || (quiz.questions ? quiz.questions.length : 0),
        price,
        quantity: 1,
        addedAt: Date.now()
      };
      
      setItems(prev => [...prev, cartItem]);
    }
  };

  const removeFromCart = (quizId) => {
    setItems(prev => prev.filter(item => item.id !== quizId));
  };

  const updateQuantity = (quizId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(quizId);
    } else {
      setItems(prev => prev.map(item => 
        item.id === quizId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};