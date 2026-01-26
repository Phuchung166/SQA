'use client';
import React from 'react';
import store, { persistor } from '../redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthCookieSync } from '@/components/auth/AuthCookieSync';

const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AuthCookieSync />
        <>{children}</>
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
