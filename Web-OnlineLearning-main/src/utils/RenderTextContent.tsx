import { Course } from '@/services/courseService';

// Function to handle text content rendering based on course data
const RenderTextContent = (item: Course) => {
  // Since the new Course type doesn't have the old styling properties,
  // we'll use a simplified version that works with the actual Course data
  return (
    <div className="bd-course-text-content">
      <div className="text-1 fs-50 mb--5 text-white">{item.title}</div>
      {item.category?.name && <div className="text-2 fs-50 text-white">{item.category.name}</div>}
      {item.level && (
        <div className="text-3 fs-28 white-bg text-primary pl-10 pr-10 pt--5 pb--5 d-inline-block latter-sp-2 uppercase">
          {item.level}
        </div>
      )}
    </div>
  );
};

export default RenderTextContent;
