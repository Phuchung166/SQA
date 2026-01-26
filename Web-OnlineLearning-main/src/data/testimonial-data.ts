import { ITestimonial } from '@/interFace/interFace';
import avatar1 from '../../public/assets/images/avatar/avatar_tuyen.jpg';

const testimonialData: ITestimonial[] = [
  {
    id: 1,
    rating: 5,
    content:
      'Các khóa học trên Online Learning đã thay đổi sự nghiệp của tôi. Các dự án thực tế và giảng viên chuyên môn đã giúp việc học trở nên mượt mà và thú vị. Rất đáng để giới thiệu!',
    name: 'Ngô Trung Tuyên',
    avatar: avatar1,
  },
  {
    id: 2,
    rating: 5,
    content:
      'Online Learning thực sự là bước ngoặt! Lịch học linh hoạt và nội dung chất lượng cao cho phép tôi nâng cao kỹ năng trong khi vẫn quản lý lịch trình bận rộn. Xin cảm ơn, Online Learning!',
    name: 'Bùi Hữu Quyết',
    avatar: avatar1,
  },
  {
    id: 3,
    rating: 5,
    content:
      'Tham gia Online Learning là quyết định tốt nhất tôi đã thực hiện năm nay. Sự đa dạng khóa học và lộ trình học cá nhân hóa đã giúp tôi đạt được mục tiêu nghề nghiệp một cách dễ dàng.',
    name: 'Lê Minh Vũ',
    avatar: avatar1,
  },
];

export default testimonialData;
