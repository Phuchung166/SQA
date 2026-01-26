export interface FAQItem {
  id: string;
  question_en: string;
  question_vi: string;
  answer_en: string;
  answer_vi: string;
}

export interface FAQCategory {
  id: string;
  name_en: string;
  name_vi: string;
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'general',
    name_en: 'General Questions',
    name_vi: 'Câu Hỏi Chung',
    items: [
      {
        id: 'q1',
        question_en: 'How do I create an account on Online Learning?',
        question_vi: 'Làm cách nào để tạo tài khoản trên Online Learning?',
        answer_en:
          'To create an account, click on the Sign Up button on the homepage, fill in your details, and follow the instructions to verify your email address. Once done, you\'ll have access to all our courses and features.',
        answer_vi:
          'Để tạo tài khoản, nhấp vào nút Đăng Ký trên trang chủ, điền thông tin của bạn và làm theo hướng dẫn để xác thực địa chỉ email. Khi hoàn tất, bạn sẽ có quyền truy cập vào tất cả các khóa học và tính năng của chúng tôi.',
      },
      {
        id: 'q2',
        question_en: 'Is there a free trial available?',
        question_vi: 'Có dùng thử miễn phí không?',
        answer_en:
          'Yes, Online Learning offers a 7-day free trial for some of its courses. During this period, you can explore course materials and resources before deciding to purchase or enroll.',
        answer_vi:
          'Có, Online Learning cung cấp dùng thử miễn phí 7 ngày cho một số khóa học của chúng tôi. Trong khoảng thời gian này, bạn có thể khám phá các tài liệu khóa học và tài nguyên trước khi quyết định mua hoặc đăng ký.',
      },
      {
        id: 'q3',
        question_en: 'What payment methods do you accept?',
        question_vi: 'Bạn chấp nhận những phương thức thanh toán nào?',
        answer_en:
          'We accept payment through Vietnamese banks only. You can transfer funds directly from your Vietnamese bank account. All payments are processed securely.',
        answer_vi:
          'Chúng tôi chỉ chấp nhận thanh toán qua các ngân hàng Việt Nam. Bạn có thể chuyển tiền trực tiếp từ tài khoản ngân hàng Việt Nam của mình. Tất cả các khoản thanh toán được xử lý an toàn.',
      },
      {
        id: 'q4',
        question_en: 'Can I access courses on mobile devices?',
        question_vi: 'Tôi có thể truy cập các khóa học trên thiết bị di động không?',
        answer_en:
          'Yes, Online Learning\'s platform is fully responsive, and you can access all our courses on your smartphone or tablet through the mobile web browser or our dedicated mobile app.',
        answer_vi:
          'Có, nền tảng Online Learning phản ứng hoàn toàn, và bạn có thể truy cập tất cả các khóa học của chúng tôi trên điện thoại thông minh hoặc máy tính bảng thông qua trình duyệt web di động hoặc ứng dụng di động chuyên dụng của chúng tôi.',
      },
      {
        id: 'q5',
        question_en: 'How do I download course materials?',
        question_vi: 'Làm cách nào để tải xuống các tài liệu khóa học?',
        answer_en:
          'Once you\'re enrolled in a course, you can download course materials such as lecture notes, presentations, and resources directly from the course page. Look for the download button next to each resource.',
        answer_vi:
          'Sau khi bạn đăng ký một khóa học, bạn có thể tải xuống các tài liệu khóa học như ghi chú bài giảng, bản trình bày và tài nguyên trực tiếp từ trang khóa học. Tìm nút tải xuống bên cạnh mỗi tài nguyên.',
      },
    ],
  },
  {
    id: 'advanced',
    name_en: 'Advanced Questions',
    name_vi: 'Câu Hỏi Nâng Cao',
    items: [
      {
        id: 'q6',
        question_en: 'Will I receive a certificate or CV after completing a course?',
        question_vi: 'Tôi có nhận được chứng chỉ hoặc CV sau khi hoàn thành khóa học không?',
        answer_en:
          'Currently, we do not provide official certificates or CVs after course completion. However, upon completion, you will have access to course materials and your learning records.',
        answer_vi:
          'Hiện tại, chúng tôi không cung cấp chứng chỉ hoặc CV chính thức sau khi hoàn thành khóa học. Tuy nhiên, sau khi hoàn thành, bạn sẽ có quyền truy cập vào tài liệu khóa học và hồ sơ học tập của bạn.',
      },
      {
        id: 'q7',
        question_en: 'Is there technical support available?',
        question_vi: 'Có hỗ trợ kỹ thuật không?',
        answer_en:
          'Yes, we provide 24/7 technical support. You can contact our support team via email, live chat, or phone. We aim to resolve any technical issues within 24 hours.',
        answer_vi:
          'Có, chúng tôi cung cấp hỗ trợ kỹ thuật 24/7. Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi qua email, trò chuyện trực tiếp hoặc điện thoại. Chúng tôi lực giải quyết mọi vấn đề kỹ thuật trong vòng 24 giờ.',
      },
      {
        id: 'q8',
        question_en: 'Can I pause or cancel my subscription?',
        question_vi: 'Tôi có thể tạm dừng hoặc hủy đăng ký của mình không?',
        answer_en:
          'Currently, we do not offer the ability to pause or cancel subscriptions. Please contact our support team if you have specific requests or concerns about your account.',
        answer_vi:
          'Hiện tại, chúng tôi không cung cấp khả năng tạm dừng hoặc hủy đăng ký. Vui lòng liên hệ với đội hỗ trợ của chúng tôi nếu bạn có yêu cầu hoặc lo ngại cụ thể về tài khoản của bạn.',
      },
      {
        id: 'q9',
        question_en: 'Are the courses updated regularly?',
        question_vi: 'Các khóa học có được cập nhật thường xuyên không?',
        answer_en:
          'Yes, our instructors regularly update course content to ensure it remains current and relevant. You\'ll have access to all updates for your purchased courses at no additional cost.',
        answer_vi:
          'Có, các giảng viên của chúng tôi thường xuyên cập nhật nội dung khóa học để đảm bảo nó vẫn hiện tại và phù hợp. Bạn sẽ có quyền truy cập vào tất cả các bản cập nhật cho các khóa học đã mua mà không tốn thêm chi phí.',
      },
      {
        id: 'q10',
        question_en: 'Can I share my account with others?',
        question_vi: 'Tôi có thể chia sẻ tài khoản của mình với người khác không?',
        answer_en:
          'No, each account is for individual use only. Sharing accounts violates our terms of service. We recommend purchasing separate accounts for family members or colleagues.',
        answer_vi:
          'Không, mỗi tài khoản chỉ dành cho sử dụng cá nhân. Chia sẻ tài khoản vi phạm điều khoản dịch vụ của chúng tôi. Chúng tôi khuyến nghị mua các tài khoản riêng biệt cho các thành viên gia đình hoặc đồng nghiệp.',
      },
    ],
  },
  {
    id: 'purchases',
    name_en: 'Purchases & Refunds',
    name_vi: 'Mua Hàng & Hoàn Tiền',
    items: [
      {
        id: 'q11',
        question_en: 'What is your refund policy?',
        question_vi: 'Chính sách hoàn tiền của bạn là gì?',
        answer_en:
          'We do not offer refunds. All course purchases are final and non-refundable. Please carefully review the course content and details before making your purchase.',
        answer_vi:
          'Chúng tôi không cung cấp hoàn tiền. Tất cả các lần mua khóa học đều là cuối cùng và không hoàn tiền. Vui lòng xem kỹ nội dung khóa học và chi tiết trước khi mua.',
      },
      {
        id: 'q12',
        question_en: 'Do you offer discount codes?',
        question_vi: 'Bạn có cung cấp mã giảm giá không?',
        answer_en:
          'Currently, we do not provide discount codes or promotional offers. All course prices are fixed. Please check our website regularly for future promotions.',
        answer_vi:
          'Hiện tại, chúng tôi không cung cấp mã giảm giá hoặc các đề nghị khuyến mãi. Tất cả giá khóa học đều cố định. Vui lòng kiểm tra trang web của chúng tôi thường xuyên để tìm các chương trình khuyến mãi trong tương lai.',
      },
      {
        id: 'q13',
        question_en: 'Can I get an invoice for my purchase?',
        question_vi: 'Tôi có thể nhận được hóa đơn cho lần mua của mình không?',
        answer_en:
          'We currently do not send invoices for course purchases. A payment confirmation will be sent to your registered email address after purchase.',
        answer_vi:
          'Chúng tôi hiện không gửi hóa đơn cho các lần mua khóa học. Xác nhận thanh toán sẽ được gửi đến địa chỉ email đã đăng ký của bạn sau khi mua.',
      },
      {
        id: 'q14',
        question_en: 'What should I do if I have issues accessing my course?',
        question_vi: 'Tôi nên làm gì nếu gặp vấn đề truy cập khóa học của mình?',
        answer_en:
          'If you experience any technical issues accessing your course, please contact our support team immediately. We\'re available 24/7 to assist you.',
        answer_vi:
          'Nếu bạn gặp bất kỳ vấn đề kỹ thuật nào khi truy cập khóa học của mình, vui lòng liên hệ với đội hỗ trợ của chúng tôi ngay lập tức. Chúng tôi luôn sẵn sàng hỗ trợ 24/7.',
      },
    ],
  },
  {
    id: 'course-info',
    name_en: 'Course Information',
    name_vi: 'Thông Tin Khóa Học',
    items: [
      {
        id: 'q16',
        question_en: 'What courses do you offer?',
        question_vi: 'Bạn cung cấp những khóa học nào?',
        answer_en:
          'We offer a wide range of online courses including programming, design, business, and more. Each course is designed by industry experts to help you gain practical skills.',
        answer_vi:
          'Chúng tôi cung cấp nhiều khóa học trực tuyến bao gồm lập trình, thiết kế, kinh doanh và nhiều hơn nữa. Mỗi khóa học được thiết kế bởi các chuyên gia trong ngành để giúp bạn có được những kỹ năng thực tế.',
      },
      {
        id: 'q17',
        question_en: 'How do I enroll in a course?',
        question_vi: 'Làm thế nào để đăng ký khóa học?',
        answer_en:
          'Simply browse our course catalog, select the course you want, and click the "Add to Cart" button. Then proceed to checkout to complete your enrollment.',
        answer_vi:
          'Đơn giản chỉ cần duyệt danh mục khóa học của chúng tôi, chọn khóa học bạn muốn và nhấp vào nút "Thêm vào giỏ hàng". Sau đó tiến hành thanh toán để hoàn tất đăng ký.',
      },
      {
        id: 'q18',
        question_en: 'Are the courses self-paced?',
        question_vi: 'Các khóa học có tự học được không?',
        answer_en:
          'Yes, most of our courses are self-paced, allowing you to learn at your own speed. However, some courses may have specific schedules and deadlines.',
        answer_vi:
          'Có, hầu hết các khóa học của chúng tôi đều tự học, cho phép bạn học với tốc độ của riêng mình. Tuy nhiên, một số khóa học có thể có lịch trình và thời hạn cụ thể.',
      },
      {
        id: 'q19',
        question_en: 'Can I download course materials to study offline?',
        question_vi: 'Tôi có thể tải xuống tài liệu khóa học để học ngoại tuyến không?',
        answer_en:
          'Most course materials can be accessed online through our platform. For offline access, please contact our support team for available options.',
        answer_vi:
          'Hầu hết tài liệu khóa học có thể được truy cập trực tuyến thông qua nền tảng của chúng tôi. Để truy cập ngoại tuyến, vui lòng liên hệ với đội hỗ trợ của chúng tôi để biết các tùy chọn có sẵn.',
      },
      {
        id: 'q20',
        question_en: 'How long can I access a course after purchase?',
        question_vi: 'Tôi có thể truy cập khóa học trong bao lâu sau khi mua?',
        answer_en:
          'Once you purchase a course, you will have permanent access to all course materials and content. You can revisit the course anytime.',
        answer_vi:
          'Sau khi mua khóa học, bạn sẽ có quyền truy cập vĩnh viễn vào tất cả tài liệu khóa học và nội dung. Bạn có thể xem lại khóa học bất kỳ lúc nào.',
      },
    ],
  }
];
