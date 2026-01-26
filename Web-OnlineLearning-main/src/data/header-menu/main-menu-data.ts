
import { MenuItem } from "@/interFace/interFace";
//import homeOneImg from "../../../public/assets/images/menu/menu-home-1.webp";
//import coummingSoonImg from "../../../public/assets/images/menu/menu-home-soon.webp";

const main_menu_data: MenuItem[] = [
  {
    id: 1,
    hasDropdown: false,
    children: false,
    active: true,
    title: "Home",
    pluseIncon: false,
    link: "/",

  },
  {
    id: 2,
    hasDropdown: false,
    active: true,
    children: false,
    title: "Courses",
    pluseIncon: false,
    link: "/courses",
    
  },
  {
    id: 3,
    hasDropdown: false,
    children: false,
    active: true,
    title: "About",
    pluseIncon: false,
    pageLayout: false,
    link: "/about-online-course",
    
  },
  {
    id: 4,
    hasDropdown: false,
    active: true,
    megaMenu: true,
    children: false,
    title: "Contact",
    pluseIncon: false,
    link: "/contact-us",
    
  },
  {
    id: 5,
    hasDropdown: true,
    children: true,
    megaMenu: false,
    active: true,
    title: "Login",
    pluseIncon: true,
    link: "/sign-in",
  },
  {
    id: 6,
    hasDropdown: true,
    active: true,
    megaMenu: true,
    children: true,
    title: "Blog",
    pluseIncon: true,
    link: "/blog-grid",
  },
];

export default main_menu_data;
