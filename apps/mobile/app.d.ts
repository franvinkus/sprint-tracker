/// <reference types="nativewind/types" />

import 'react';
import 'react-native';

// 1. Tembak ke modul React 19 (Cara Agent Gravity)
declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
    }
  }
}

// 2. Tembak ke Global Namespace (Menjaga jika tipe Next.js bocor ke sini)
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
    }
  }
}

// 3. Tembak langsung ke komponen React Native (Cara Tradisional)
declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface SafeAreaViewProps {
    className?: string;
  }
}