# ConfirmModal - Quick Reference

## 🚀 Quick Start

```typescript
import { showDangerConfirmModal } from '@/components/common/modals';

showDangerConfirmModal({
  title: 'Delete Item',
  content: 'Are you sure?',
  okText: 'Delete',
  cancelText: 'Cancel',
  onOk: async () => {
    await deleteItem(id);
  },
});
```

## 📋 All Functions

### 1. showConfirmModal

General purpose confirmation

```typescript
showConfirmModal({
  title: string,
  content: string | ReactNode,
  okText?: string,
  cancelText?: string,
  okType?: 'primary' | 'danger' | 'default',
  onOk?: () => void | Promise<void>,
  onCancel?: () => void,
});
```

### 2. showDangerConfirmModal

For destructive actions (red button)

```typescript
showDangerConfirmModal({
  title: string,
  content: string | ReactNode,
  okText?: string,
  cancelText?: string,
  onOk?: () => void | Promise<void>,
});
```

### 3. showDeleteConfirmModal

Pre-configured for delete

```typescript
showDeleteConfirmModal({
  itemName: string,
  itemType?: string,
  okText?: string,
  cancelText?: string,
  onOk: () => void | Promise<void>,
});
```

## 🎯 Common Patterns

### Pattern 1: Delete with Notification

```typescript
const handleDelete = async (id: number) => {
  showDangerConfirmModal({
    title: 'Delete Course',
    content: 'This cannot be undone',
    onOk: async () => {
      try {
        await deleteCourse(id);
        notification.success({ message: 'Deleted!' });
      } catch (error) {
        notification.error({ message: 'Failed!' });
      }
    },
  });
};
```

### Pattern 2: With Translations

```typescript
const t = useTranslations('dashboard');

showDangerConfirmModal({
  title: t('deleteTitle'),
  content: t('deleteConfirm', { name }),
  okText: t('delete'),
  cancelText: t('cancel'),
  onOk: async () => { ... },
});
```

### Pattern 3: Simple Delete

```typescript
showDeleteConfirmModal({
  itemName: course.title,
  itemType: 'Course',
  onOk: async () => {
    await deleteCourse(course.id);
  },
});
```

## ⚡ Cheatsheet

| Action  | Function                 | okType  |
| ------- | ------------------------ | ------- |
| Delete  | `showDangerConfirmModal` | danger  |
| Archive | `showDangerConfirmModal` | danger  |
| Publish | `showConfirmModal`       | primary |
| Update  | `showConfirmModal`       | primary |
| Generic | `showConfirmModal`       | primary |

## 🎨 Customization

```typescript
showConfirmModal({
  title: 'Custom Modal',
  content: <div>Custom JSX content</div>,
  okText: 'Proceed',
  cancelText: 'Abort',
  okType: 'primary',
  width: 600,
  icon: <CustomIcon />,
  onOk: async () => { ... },
  onCancel: () => { ... },
});
```

## ✅ Best Practices

1. ✅ Use `showDangerConfirmModal` for destructive actions
2. ✅ Always handle errors in `onOk`
3. ✅ Show success/error notifications
4. ✅ Use translations for i18n
5. ✅ Provide specific item names in content
6. ❌ Don't use generic "Are you sure?"
7. ❌ Don't forget error handling

## 📍 Import Path

```typescript
import {
  showConfirmModal,
  showDangerConfirmModal,
  showDeleteConfirmModal,
} from '@/components/common/modals';
```

## 🔗 See Also

- Full docs: `src/components/common/modals/README.md`
- Examples: `src/components/common/modals/EXAMPLES.tsx`
- Summary: `src/components/common/modals/SUMMARY.md`
