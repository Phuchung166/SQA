interface Lecture {
    title: string;
    duration: string;
}

interface ICurriculam {
    title: string;
    lectures: Lecture[];
}

const curriculamData: ICurriculam[] = [
    {
        title: "Giới thiệu phát triển web",
        lectures: [
            { title: "Tổng quan về HTML, CSS và JavaScript", duration: "08:45" },
            { title: "Thiết lập môi trường phát triển", duration: "10:22" },
        ],
    },
    {
        title: "Xây dựng trang web đầu tiên",
        lectures: [
            { title: "Tạo và cấu trúc các phần tử HTML", duration: "12:30" },
            { title: "Định dạng trang với CSS", duration: "15:10" },
        ],
    },
    {
        title: "Kiến thức cơ bản về JavaScript",
        lectures: [
            { title: "Giới thiệu cú pháp JavaScript", duration: "18:30" },
            { title: "Làm việc với biến và kiểu dữ liệu", duration: "14:45" },
        ],
    },
    {
        title: "Tương tác DOM với JavaScript",
        lectures: [
            { title: "Chọn và sửa đổi phần tử", duration: "16:20" },
            { title: "Xử lý sự kiện trong JavaScript", duration: "11:45" },
        ],
    },
    {
        title: "Nâng cao JavaScript: ES6+",
        lectures: [
            { title: "Hàm mũi tên và template literals", duration: "12:00" },
            { title: "Module, lớp và kế thừa", duration: "13:25" },
        ],
    },
    {
        title: "Kiến thức cơ bản về React",
        lectures: [
            { title: "Giới thiệu các component trong React", duration: "18:50" },
            { title: "Quản lý state trong React", duration: "16:40" },
        ],
    },
    {
        title: "Phát triển Full-Stack với Node.js",
        lectures: [
            { title: "Xây dựng REST API với Express", duration: "20:10" },
            { title: "Kết nối MongoDB bằng Mongoose", duration: "22:35" },
        ],
    },
];

export default curriculamData;