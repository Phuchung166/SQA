import { IBlog } from "@/interFace/interFace";
import blogImg1 from "../../public/assets/images/blog/blog-thumb-01.webp";
import blogImg2 from "../../public/assets/images/blog/blog-thumb-02.webp";
import blogImg3 from "../../public/assets/images/blog/blog-thumb-03.webp";
//university blog image
import blogImg4 from "../../public/assets/images/blog/blog-thumb-04.webp";
import blogImg5 from "../../public/assets/images/blog/blog-thumb-05.webp";
import blogImg6 from "../../public/assets/images/blog/blog-thumb-06.webp";
//modern scholling image
import blogImg7 from "../../public/assets/images/blog/blog-thumb-07.webp";
import blogImg8 from "../../public/assets/images/blog/blog-thumb-08.webp";
import blogImg9 from "../../public/assets/images/blog/blog-thumb-09.webp";
//shop blog image
import blogImg10 from "../../public/assets/images/blog/blog-thumb-23.webp";
import blogImg11 from "../../public/assets/images/blog/blog-thumb-20.webp";
import blogImg12 from "../../public/assets/images/blog/blog-thumb-21.webp";
import blogImg13 from "../../public/assets/images/blog/blog-thumb-22.webp";
//blog image
import blogImg14 from "../../public/assets/images/blog/blog-thumb-10.webp";
import blogImg15 from "../../public/assets/images/blog/blog-thumb-16.webp";
//blog list
import blogImg16 from "../../public/assets/images/blog/blog-thumb-17.webp"
import blogImg17 from "../../public/assets/images/blog/blog-thumb-18.webp"
import blogImg18 from "../../public/assets/images/blog/blog-thumb-19.webp"
//kindergarten page blog image
import blogImg19 from "../../public/assets/images/blog/blog-thumb-11.webp";
import blogImg20 from "../../public/assets/images/blog/blog-thumb-12.webp";
//kindergarten page blog image
import blogImg21 from "../../public/assets/images/blog/blog-thumb-13.webp";
import blogImg22 from "../../public/assets/images/blog/blog-thumb-14.webp";
import blogImg23 from "../../public/assets/images/blog/blog-thumb-15.webp";


const blogData: IBlog[] = [
    {
        id: 1,
        image: blogImg1,
        title: "Cách giữ động lực và thành công trong khóa học trực tuyến",
        authorName: "Alice Johnson",
        date: "10 Tháng 11, 2024",
        description: "Khám phá những cuốn sách cần có trong mùa này, từ tiểu thuyết hồi hộp đến tiểu sử truyền cảm hứng."
    },
    {
        id: 2,
        image: blogImg2,
        title: "Chọn khóa học trực tuyến phù hợp với mục tiêu của bạn",
        authorName: "Michael Smith",
        date: "08 Tháng 11, 2024",
        description: "Khám phá những cuốn sách đáng đọc trong mùa này, những câu chuyện tiểu sử truyền cảm hứng."
    },
    {
        id: 3,
        image: blogImg3,
        title: "Công cụ công nghệ cần thiết để thành công với khóa học trực tuyến",
        authorName: "Emma Brown",
        date: "12 Tháng 11, 2024",
        description: "Những cuốn sách nổi bật của mùa này, từ truyện ly kỳ đến tiểu sử truyền cảm hứng."
    },
    // university blog data start
    {
        id: 4,
        image: blogImg4,
        date: '15',
        month: 'Jan',
        authorName: 'Anderson',
        comments: 0,
        title: 'Cách chọn chuyên ngành phù hợp: Những góc nhìn từ cựu sinh viên',

    },
    {
        id: 5,
        image: blogImg5,
        date: '13',
        month: 'Aug',
        authorName: 'Shawn Mendis',
        comments: 1,
        title: 'Lợi ích của việc tham gia câu lạc bộ và hội nhóm trong trường đại học',
    },
    {
        id: 6,
        image: blogImg6,
        date: '20',
        month: 'Feb',
        authorName: 'Andrew Tye',
        comments: 3,
        title: 'Kinh nghiệm du học: Những câu chuyện từ khắp nơi trên thế giới',
    },
    //modern schooling blog data start
    {
        id: 7,
        image: blogImg7,
        title: "Các trường học hiện đại đang định hình tương lai như thế nào",
        authorName: "Peterson",
        date: "25 Tháng 2, 2024",
        description: "Tìm hiểu cách công nghệ tiên tiến và phương pháp giảng dạy tiên phong đang chuẩn bị cho học sinh thị trường việc làm trong tương lai"
    },
    {
        id: 8,
        image: blogImg8,
        title: "Nuôi dưỡng sáng tạo: Những phương pháp giáo dục hiện đại",
        authorName: "Steven Smith",
        date: "08 Tháng 3, 2024",
        description: "Thảo luận tầm quan trọng của sáng tạo trong chương trình học và cách các trường đưa nghệ thuật và tư duy đổi mới vào học tập hàng ngày"
    },
    {
        id: 9,
        image: blogImg9,
        title: "Chuẩn bị học sinh cho một thế giới học tập toàn cầu hóa",
        authorName: "Emma Brown",
        date: "12 Tháng 4, 2024",
        description: "Nêu bật tầm quan trọng của nhận thức toàn cầu trong giáo dục và cách các trường hiện đại tích hợp các chương trình phù hợp"
    },
    //Shop blog data start
    {
        id: 10,
        image: blogImg10,
        badge: "Khóa học",
        title: "10 cuốn sách hàng đầu nên thêm vào bộ sưu tập của bạn",
        authorName: "Alex Harper",
        date: "10 Tháng 8, 2024",
    },
    {
        id: 11,
        image: blogImg11,
        badge: "Khóa học",
        title: "5 mẹo để tạo góc đọc hoàn hảo",
        authorName: "Sophie Bennett",
        date: "10 Tháng 8, 2024",
    },
    {
        id: 12,
        image: blogImg12,
        badge: "Khóa học",
        title: "Khám phá thể loại: Tìm sở thích của bạn",
        authorName: "Michael Reed",
        date: "10 Tháng 8, 2024",
    },
    {
        id: 13,
        image: blogImg13,
        badge: "Khóa học",
        title: "Top 5 cuốn sách bắt buộc phải đọc để phát triển bản thân",
        authorName: "Jessica Parker",
        date: "10 Tháng 8, 2024",
    },
    //blog sidebar recent data start
    {
        id: 14,
        image: blogImg1,
        title: "Khám phá chiến lược học trực tuyến",
        authorName: "Alex Harper",
        date: "10 Tháng 10, 2024",
    },
    {
        id: 15,
        image: blogImg4,
        title: "Tương lai giáo dục đại học",
        authorName: "Sophie Bennett",
        date: "25 Tháng 9, 2024",
    },
    {
        id: 16,
        image: blogImg14,
        title: "Học mẫu giáo thông qua trò chơi",
        authorName: "Michael Reed",
        date: "05 Tháng 8, 2024",
    },

    //blog data
    {
        id: 17,
        type: 'image',
        image: blogImg15,
        authorName: 'Alex',
        date: '27 Oct 2022',
        comments: 0,
        buttonShow: true,
        title: 'Empowering Students Through Innovative Learning Techniques',
        description: 'Discover how innovative learning techniques empower students, enhancing their educational experience, improving engagement, and fostering a love for lifelong learning in today’s digital age.',
        daynamicLink: true,
        boxShadowClass: true
    },
    {
        id: 18,
        type: 'slider',
        images: [
            blogImg1,
            blogImg2,
            blogImg3,
        ],
        authorName: 'Alex',
        date: '27 Oct 2022',
        comments: 0,

        title: 'Transforming Education with Technology in the Classroom',
        description: 'Explore the transformative impact of technology in the classroom, offering educators new tools to enhance student learning and engagement while preparing them for future careers.',
        buttonShow: true,
        daynamicLink: true,
        boxShadowClass: true
    },
    {
        id: 19,
        type: 'quote',
        quote: 'I’m for truth no matter who tells it. I’m for justice no matter who it is for or against.',
        authorName: 'Malcolm X',
        boxShadowClass: false
    },
    {
        id: 20,
        type: 'video',
        thumbnail: blogImg15,
        title: 'The Importance of Emotional Intelligence in Education',
        description: 'Understand the significance of emotional intelligence in education, helping students develop empathy, resilience, and strong interpersonal skills essential for success in academic and professional settings.',
        buttonShow: true,
        buttonLink: true,
        boxShadowClass: true
    },
    {
        id: 21,
        type: 'audio',
        title: 'Strategies for Fostering Critical Thinking in Students',
        description: 'Learn effective strategies for fostering critical thinking skills in students, encouraging them to analyze, evaluate, and create solutions to complex problems they encounter daily.',
        buttonShow: true,
        buttonLink: true,
        boxShadowClass: true
    },
    {
        id: 22,
        type: 'text',
        title: 'Promoting Inclusivity in Education for Diverse Learners',
        description: 'Discover ways to promote inclusivity in education, creating supportive environments for diverse learners and ensuring that all students receive the opportunities they deserve to thrive.',
        buttonShow: true,
        buttonLink: true,
        boxShadowClass: true
    },
    //blog list data
    {
        id: 23,
        badge: "Online Course",
        image: blogImg5,
        title: "The rise of online learning platforms in 2024",
        authorName: "Alice Johnson",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Online learning has transformed education by providing accessibility and flexibility to learners worldwide."
    },
    {
        id: 24,
        badge: "University",
        image: blogImg6,
        title: "Top trends shaping university education",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Universities are adapting to new technologies and changing the traditional educational landscape to meet students' needs."
    },
    {
        id: 25,
        badge: "Kindergarten",
        image: blogImg14,
        title: "How kindergarten education prepares children for the future",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Early childhood education is essential for laying a strong foundation for future learning and development."
    },
    {
        id: 26,
        badge: "Modern Schooling",
        image: blogImg7,
        title: "The impact of technology on modern schooling",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Technology is revolutionizing how students learn, bringing new opportunities and challenges to the classroom."
    },
    {
        id: 27,
        badge: "Quran Learning",
        image: blogImg8,
        title: "The benefits of online Quran learning programs",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Learning the Quran online has opened up new opportunities for students to study the sacred text from home."
    },
    {
        id: 28,
        badge: "Online Course",
        image: blogImg16,
        title: "How online courses are reshaping career paths",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Professionals are turning to online courses to gain new skills, enhancing their careers in a flexible manner."
    },
    {
        id: 29,
        badge: "University",
        image: blogImg17,
        title: "Challenges and opportunities for universities post-pandemic",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Universities are evolving their approaches to education as they adapt to a post-pandemic world."
    },
    {
        id: 30,
        badge: "Kindergarten",
        image: blogImg18,
        title: "How kindergartens are adapting to new educational tools",
        authorName: "Michael Smith",
        date: "Dec 25, 2024",
        comments: 12,
        description: "Kindergartens are embracing new technologies to enhance the learning experience for young children."
    },
    //Similar blog data
    {
        id: 31,
        image: blogImg8,
        title: "The rise of online learning platforms in 2024",
        authorName: "Kevin Brown",
        date: "September 25, 2024",
        description: "Online learning has transformed education by providing accessibility and flexibility to learners worldwide."
    },
    {
        id: 32,
        image: blogImg5,
        title: "Top trends shaping university education",
        authorName: "Ross Tylor",
        date: "September 25 2024",
        description: "Universities are adapting to new technologies and changing the traditional educational landscape to meet students' needs."
    },
    {
        id: 33,
        image: blogImg6,
        title: "How kindergarten education prepares children for the future",
        authorName: "Williamson",
        date: "Dec 25, 2024",
        description: "Early childhood education is essential for laying a strong foundation for future learning and development."
    },
    {
        id: 34,
        image: blogImg15,
        title: "The impact of technology on modern schooling",
        authorName: "Martin Guptil",
        date: "September 25 2024",
        description: "Technology is revolutionizing how students learn, bringing new opportunities and challenges to the classroom."
    },
    {
        id: 35,
        image: blogImg8,
        title: "The rise of online learning platforms in 2024",
        authorName: "Jaminson",
        date: "September 25, 2024",
        description: "Online learning has transformed education by providing accessibility and flexibility to learners worldwide."
    },
    {
        id: 36,
        image: blogImg5,
        title: "Top trends shaping university education",
        authorName: "Stuart Broad",
        date: "September 25 2024",
        description: "Universities are adapting to new technologies and changing the traditional educational landscape to meet students' needs."
    },
    //kindergarten home page blog data start
    {
        id: 37,
        date: '10 Aug 2024',
        authorName: 'Bret Lee',
        comments: 0,
        title: 'Creativity Work Art Sparks Growth in Early Childhood',
        description: 'In the process of creating art, children exercise their imagination, develop storytelling skills, and engage in imaginative play.',
        image: blogImg14,
    },
    {
        id: 38,
        date: '20 May 2024',
        authorName: 'David William',
        comments: 0,
        title: 'The Benefits of Play-Based Learning in Kindergarten',
        description: 'As children play together, they learn to get along with one another, cooperate, communicate effectively.',
        image: blogImg19,
    },
    {
        id: 39,
        date: '05 Aug 2024',
        authorName: 'Josheph',
        comments: 0,
        title: 'Exploring Nature How Outdoor Play & Learning',
        description: 'This unrestricted play encourages problem-solving skills and critical thinking as children navigate the challenges.',
        image: blogImg20,
    },
    //quran learning blog data start
    {
        id: 40,
        image: blogImg21,
        badge: "Kiến thức Hồi giáo",
        title: "Trí tuệ của sự kiên nhẫn trong Hồi giáo",
        authorName: "Imam Hassan",
        date: "12 Tháng 3, 2024"
    },
    {
        id: 41,
        image: blogImg22,
        badge: "Nghiên cứu Hồi giáo",
        title: "Hiểu về Ngũ trụ cột trong Hồi giáo",
        authorName: "Aisha Zain",
        date: "12 Tháng 3, 2024"
    },
    {
        id: 42,
        image: blogImg23,
        badge: "Tâm linh",
        title: "Vai trò của lòng nhân ái trong Hồi giáo",
        authorName: "Ahmed Karim",
        date: "05 Tháng 4, 2024"
    }
];
export default blogData;