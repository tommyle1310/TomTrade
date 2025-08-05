import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import AppNavigator from './navigation/AppNavigator';
import { apolloClient } from './apollo/client';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppNavigator />
      <StatusBar style="auto" />
    </ApolloProvider>
  );
}
