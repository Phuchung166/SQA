'use client';

import React from 'react';
import { Modal, App } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

// Global modal instance holder
let globalModal: ReturnType<typeof App.useApp>['modal'] | null = null;

export const setGlobalModal = (modal: ReturnType<typeof App.useApp>['modal']) => {
  globalModal = modal;
};

export interface ConfirmModalOptions {
  /** Modal title */
  title: string;
  /** Modal content/description */
  content: string | React.ReactNode;
  /** OK button text */
  okText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** OK button type */
  okType?: 'primary' | 'danger' | 'default';
  /** Callback when user confirms */
  onOk?: () => void | Promise<void>;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Show loading state on OK button */
  okButtonProps?: {
    loading?: boolean;
  };
  /** Custom icon */
  icon?: React.ReactNode;
  /** Modal width */
  width?: number | string;
}

/**
 * Show a confirmation modal dialog
 *
 * @example
 * ```tsx
 * import { showConfirmModal } from '@/components/common/modals/ConfirmModal';
 *
 * showConfirmModal({
 *   title: 'Delete Course',
 *   content: 'Are you sure you want to delete this course?',
 *   okText: 'Yes, Delete',
 *   cancelText: 'Cancel',
 *   okType: 'danger',
 *   onOk: async () => {
 *     await deleteCourse(id);
 *   }
 * });
 * ```
 */
export const showConfirmModal = (options: ConfirmModalOptions) => {
  const {
    title,
    content,
    okText = 'OK',
    cancelText = 'Cancel',
    okType = 'primary',
    onOk,
    onCancel,
    okButtonProps,
    icon,
    width,
  } = options;

  const modalConfig = {
    title,
    content,
    okText,
    cancelText,
    okType,
    icon: icon !== undefined ? icon : <ExclamationCircleFilled />,
    width,
    okButtonProps,
    onOk: async () => {
      if (onOk) {
        await onOk();
      }
    },
    onCancel: () => {
      if (onCancel) {
        onCancel();
      }
    },
    centered: false,
    style: { top: 100 }, // Position modal 100px from top
    maskClosable: false,
  };

  // Use global modal if available, otherwise fallback to Modal.confirm
  if (globalModal) {
    return globalModal.confirm(modalConfig);
  }

  return Modal.confirm(modalConfig);
};

/**
 * Show a danger/warning confirmation modal (red OK button)
 */
export const showDangerConfirmModal = (options: Omit<ConfirmModalOptions, 'okType'>) => {
  return showConfirmModal({
    ...options,
    okType: 'danger',
  });
};

/**
 * Show a delete confirmation modal
 */
export const showDeleteConfirmModal = (options: {
  itemName: string;
  itemType?: string;
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
}) => {
  const { itemName, itemType = 'item', onOk, onCancel, okText, cancelText } = options;

  return showDangerConfirmModal({
    title: `Delete ${itemType}`,
    content: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    okText: okText || 'Yes, Delete',
    cancelText: cancelText || 'Cancel',
    onOk,
    onCancel,
  });
};

// Export default for component usage if needed
const ConfirmModal = {
  show: showConfirmModal,
  showDanger: showDangerConfirmModal,
  showDelete: showDeleteConfirmModal,
};

export default ConfirmModal;
