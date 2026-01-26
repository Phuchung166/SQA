import { ContactItem } from "@/interFace/interFace";

export const contactData: ContactItem[] = [
    {
        icon: "fa-light fa-map-marker-alt",
        title: "New York Office",
        details: [
            "123 Fifth Avenue, NY 10160, USA",
            { text: "www.Online Learning.com", link: "https://www.Online Learning.com" }
        ]
    },
    {
        icon: "fa-light fa-phone",
        title: "Call Us",
        details: [
            "+1 (800) 123-4567",
            "+1 (800) 987-6543"
        ]
    },
    {
        icon: "fa-light fa-envelope",
        title: "Email Us",
        details: [
            { text: "info@Online Learning.com", link: "mailto:info@Online Learning.com" },
            { text: "support@Online Learning.com", link: "mailto:support@Online Learning.com" }
        ]
    },
    {
        icon: "fa-light fa-globe",
        title: "Visit Our Website",
        details: [
            { text: "www.Online Learning.com", link: "https://www.Online Learning.com" },
            { text: "www.Online Learning.info", link: "https://www.Online Learning.info" }
        ]
    }
];