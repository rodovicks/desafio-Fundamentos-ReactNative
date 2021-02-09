import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@GoMarket:Products');
      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      let prods = products.map(prod => {
        if (prod.id === id) return { ...prod, quantity: prod.quantity + 1 };
        return prod;
      });

      console.log(prods)

      setProducts(prods)
      await AsyncStorage.setItem(
        '@GoMarket:Products',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      let prods = products.map(prod => {
        if (prod.id === id) {
          return { ...prod, quantity: prod.quantity - 1 };
        }
        return prod;
      });

      prods = prods.filter(prod => prod.quantity !== 0);

      console.log(prods)

      setProducts(prods);
      await AsyncStorage.setItem(
        '@GoMarket:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const prod: Product[] = products.filter(prod => product.id === prod.id);

      if (prod.length > 0) {
        increment(prod[0].id);
        return;
      }
      setProducts(state => [
        ...state,
        {
          ...product,
          quantity: 1,
        },
      ]);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify([
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ]),
      );
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
