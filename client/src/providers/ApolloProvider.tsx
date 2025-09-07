'use client';
import React, { ReactNode } from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from '../lib/apollo-client';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
};