# Constants Documentation

This folder contains all application-wide constants organized by domain.

## Files

### CourseConstants.ts

Course-related constants including view modes, status, levels, and sort options.

**Usage:**

```typescript
import { COURSE_VIEW_MODE, COURSE_STATUS, COURSE_LEVEL } from '@/constants';

// In component
<CommonCourseSingleCard
  course={course}
  viewMode={COURSE_VIEW_MODE.INSTRUCTOR}
/>

// Type checking
const level: CourseLevel = COURSE_LEVEL.BEGINNER;
```

**Available Constants:**

- `COURSE_VIEW_MODE`: 'default' | 'student' | 'instructor'
- `COURSE_STATUS`: 'draft' | 'published' | 'archived'
- `COURSE_LEVEL`: 'beginner' | 'intermediate' | 'advanced'
- `COURSE_SORT`: 'createdAt' | 'title' | 'price' | 'avgRating'
- `SORT_ORDER`: 'asc' | 'desc'

### UserConstants.ts

User-related constants including roles and permissions.

### HelperConstants.ts

Helper utility constants.

### CategoryConstants.ts

Category-related constants.

## Best Practices

1. **Always use constants instead of string literals:**

   ```typescript
   // ❌ Bad
   if (viewMode === 'instructor') {
   }

   // ✅ Good
   if (viewMode === COURSE_VIEW_MODE.INSTRUCTOR) {
   }
   ```

2. **Import from central index:**

   ```typescript
   // ✅ Preferred
   import { COURSE_VIEW_MODE, USER_ROLES } from '@/constants';

   // ✅ Also acceptable (more specific)
   import { COURSE_VIEW_MODE } from '@/constants/CourseConstants';
   ```

3. **Use TypeScript types for type safety:**

   ```typescript
   import { type CourseViewMode } from '@/constants';

   interface Props {
     viewMode: CourseViewMode; // Auto-complete and type checking
   }
   ```

4. **Add JSDoc comments for new constants:**
   ```typescript
   /**
    * Course visibility options
    * Determines who can see the course
    */
   export const COURSE_VISIBILITY = {
     /** Anyone can see the course */
     PUBLIC: 'public',
     /** Only enrolled students can see */
     PRIVATE: 'private',
   } as const;
   ```

## Why Use Constants?

1. **Type Safety**: TypeScript can catch typos at compile time
2. **Autocomplete**: IDE suggests available options
3. **Refactoring**: Change value in one place affects all usages
4. **Documentation**: Self-documenting code with descriptive names
5. **Consistency**: Same values used across the application
