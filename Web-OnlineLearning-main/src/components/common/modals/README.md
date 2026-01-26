# Confirm Modal Component

A reusable confirmation modal component built on top of Ant Design Modal.

## Features

- ✅ Type-safe with TypeScript
- ✅ Customizable title, content, buttons
- ✅ Support for danger/warning actions
- ✅ Async onOk handler support
- ✅ Pre-built delete confirmation
- ✅ Positioned at top (100px from top)
- ✅ Prevents accidental closure

## Usage

### Basic Confirmation

```typescript
import { showConfirmModal } from '@/components/common/modals';

showConfirmModal({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  okText: 'Yes',
  cancelText: 'No',
  onOk: () => {
    console.log('User confirmed');
  },
  onCancel: () => {
    console.log('User cancelled');
  },
});
```

### Danger/Warning Confirmation

```typescript
import { showDangerConfirmModal } from '@/components/common/modals';

showDangerConfirmModal({
  title: 'Delete Item',
  content: 'This action cannot be undone.',
  okText: 'Delete',
  cancelText: 'Cancel',
  onOk: async () => {
    await deleteItem(id);
  },
});
```

### Delete Confirmation (Simplified)

```typescript
import { showDeleteConfirmModal } from '@/components/common/modals';

showDeleteConfirmModal({
  itemName: 'My Course',
  itemType: 'Course',
  okText: 'Yes, Delete',
  cancelText: 'Cancel',
  onOk: async () => {
    await deleteCourse(courseId);
  },
});
```

### With Translations

```typescript
import { useTranslations } from 'next-intl';
import { showDangerConfirmModal } from '@/components/common/modals';

const t = useTranslations('instructorDashboard');

showDangerConfirmModal({
  title: t('deleteCourseTitle'),
  content: t('deleteCourseConfirm', { courseName: course.title }),
  okText: t('confirmDelete'),
  cancelText: t('cancel'),
  onOk: async () => {
    await deleteCourse(courseId);
  },
});
```

### With Notifications

```typescript
import { showDangerConfirmModal } from '@/components/common/modals';
import { useNotification } from '@/hooks/useMessage';

const notification = useNotification();

showDangerConfirmModal({
  title: 'Delete Course',
  content: 'Are you sure?',
  okText: 'Delete',
  onOk: async () => {
    try {
      await deleteCourse(courseId);
      notification.success({
        message: 'Success',
        description: 'Course deleted successfully',
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete course',
      });
    }
  },
});
```

## API

### showConfirmModal(options)

Main function to show a confirmation modal.

**Options:**

| Property     | Type                                 | Default                       | Description              |
| ------------ | ------------------------------------ | ----------------------------- | ------------------------ |
| `title`      | `string`                             | -                             | Modal title (required)   |
| `content`    | `string \| ReactNode`                | -                             | Modal content (required) |
| `okText`     | `string`                             | `'OK'`                        | Text for OK button       |
| `cancelText` | `string`                             | `'Cancel'`                    | Text for Cancel button   |
| `okType`     | `'primary' \| 'danger' \| 'default'` | `'primary'`                   | OK button type           |
| `onOk`       | `() => void \| Promise<void>`        | -                             | Callback when confirmed  |
| `onCancel`   | `() => void`                         | -                             | Callback when cancelled  |
| `icon`       | `ReactNode`                          | `<ExclamationCircleFilled />` | Custom icon              |
| `width`      | `number \| string`                   | -                             | Modal width              |

### showDangerConfirmModal(options)

Shortcut for danger/warning confirmations (red OK button).

**Options:** Same as `showConfirmModal` except `okType` is always `'danger'`

### showDeleteConfirmModal(options)

Pre-configured for delete confirmations.

**Options:**

| Property     | Type                          | Default         | Description                           |
| ------------ | ----------------------------- | --------------- | ------------------------------------- |
| `itemName`   | `string`                      | -               | Name of item to delete (required)     |
| `itemType`   | `string`                      | `'item'`        | Type of item (e.g., 'Course', 'User') |
| `okText`     | `string`                      | `'Yes, Delete'` | Text for OK button                    |
| `cancelText` | `string`                      | `'Cancel'`      | Text for Cancel button                |
| `onOk`       | `() => void \| Promise<void>` | -               | Callback when confirmed (required)    |
| `onCancel`   | `() => void`                  | -               | Callback when cancelled               |

## Examples in Codebase

### InstructorCoursesMain.tsx

```typescript
const handleDeleteCourse = (courseId: number) => {
  const courseToDelete = courses.find(c => c.id === courseId);

  showDangerConfirmModal({
    title: t('deleteCourseTitle'),
    content: t('deleteCourseConfirm', { courseName: courseToDelete?.title }),
    okText: t('confirmDelete'),
    cancelText: t('cancel'),
    onOk: async () => {
      await deleteCourse(courseId);
      notification.success({ message: t('deleteCourseSuccess') });
      fetchCourses(); // Refresh list
    },
  });
};
```

## Best Practices

1. **Always provide meaningful titles and content**
   - ❌ Bad: `title: 'Confirm'`, `content: 'Are you sure?'`
   - ✅ Good: `title: 'Delete Course'`, `content: 'Are you sure you want to delete "Introduction to React"?'`

2. **Use danger type for destructive actions**

   ```typescript
   // ✅ For delete, remove, archive
   showDangerConfirmModal({ ... })

   // ✅ For normal confirmations
   showConfirmModal({ ... })
   ```

3. **Handle errors in async onOk**

   ```typescript
   onOk: async () => {
     try {
       await deleteItem();
       notification.success({ ... });
     } catch (error) {
       notification.error({ ... });
     }
   }
   ```

4. **Use translations for i18n support**

   ```typescript
   title: t('deleteCourseTitle'),
   content: t('deleteCourseConfirm', { courseName }),
   ```

5. **Provide specific item names in content**

   ```typescript
   // ✅ Good - user knows exactly what they're deleting
   content: `Delete "${course.title}"?`;

   // ❌ Bad - too generic
   content: 'Delete this item?';
   ```

## Styling

The modal inherits Ant Design styles and is:

- Positioned at top of screen (100px from top)
- Cannot be dismissed by clicking outside (maskClosable: false)
- Has consistent button styling based on `okType`

## Related

- [Ant Design Modal](https://ant.design/components/modal)
- [useNotification Hook](../../../hooks/useMessage.ts)
