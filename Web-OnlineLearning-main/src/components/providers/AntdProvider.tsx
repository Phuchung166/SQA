'use client';
import { App } from 'antd';
import { ReactNode, useEffect } from 'react';
import { setGlobalModal } from '@/components/common/modals/ConfirmModal';

interface AntdProviderProps {
  children: ReactNode;
}

function AntdProviderInner({ children }: AntdProviderProps) {
  const { modal } = App.useApp();

  useEffect(() => {
    // Set global modal instance for use outside React components
    setGlobalModal(modal);
  }, [modal]);

  return <>{children}</>;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <App>
      <AntdProviderInner>{children}</AntdProviderInner>
    </App>
  );
}
