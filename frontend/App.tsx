import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import AppNavigator from './navigation/AppNavigator';
import { apolloClient } from './apollo/client';
import { ToastProvider } from './components/Toast';
import { ModalProvider } from './components/Modal';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastProvider>
        <ModalProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ModalProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}
