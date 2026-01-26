import { User } from './user'

// Course types
export interface CourseReview {
    course_id: number
    total_reviews: number
    avg_rating: number
    total_rating1: number
    total_rating2: number
    total_rating3: number
    total_rating4: number
    total_rating5: number
}

export interface Course {
    id: string
    title: string
    slug: string
    description: string
    short_description: string
    thumbnail: string
    preview_video?: string
    instructor_id: string
    instructor_name?: string
    category_id: number
    category_name?: string
    level: string
    language: string
    price: number
    original_price?: number
    currency: string
    status: string
    is_priority: boolean
    is_free: boolean
    duration: number
    total_lessons: number
    total_students: number
    total_reviews: number
    requirements?: string
    what_you_learn?: string
    target_audience?: string
    published_at?: string
    created_at: string
    updated_at: string
    course_type: string
    review?: CourseReview
}

export interface CourseDetail extends Course {
    category: {
        name: string
    }
    instructor: {
        first_name: string
        last_name: string
        account_name: string
        avatar: string
        expertise: string
        qualification: string
        bio: string
    }
}

// Course Module & Lesson types
export interface Lesson {
    id: number
    module_id: number
    title: string
    description: string
    content_type: string
    video_url?: string
    document_url?: string
    content?: string
    duration: number
    sort_order: number
    is_mandatory: boolean
    is_preview: boolean
    created_at: string
    is_completed?: boolean
    updated_at: string
}

export interface Quiz {
    id: number
    title: string
    description: string
    is_mandatory: boolean
    created_at: string
    updated_at: string
}

export interface CourseModule {
    id: number
    course_id: number
    title: string
    description: string
    is_preview: boolean
    sort_order: number
    total_lessons: number
    duration: number
    created_at: string
    updated_at: string
    lessons?: Lesson[]
    quizzes?: Quiz[]
}

export interface CourseModulesResponse {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    has_next: boolean
    has_previous: boolean
    data: CourseModule[]
}

// Instructor types
export interface Instructor {
    id: string
    user_id: string
    user?: User
    expertise?: string
    experience_years?: number
    qualification?: string
    bank_account?: string
    bank_name?: string
    tax_code?: string
    commission_rate: number
    total_courses: number
    total_students: number
    total_revenue: number
    created_at: string
    updated_at: string
}

// Category types
export interface Category {
    id: number
    name: string
    slug?: string
    description?: string
    parentId?: number
    is_active: boolean
    created_at: string
    updated_at: string
    image?: string
    totalCourses?: number
}

// Role & Permission types
export interface Role {
    id: number
    name: string
    description?: string
    permissions?: Permission[]
    created_at: string
}

export interface Permission {
    id: number
    name: string
    description?: string
    module: string
    action: string
    created_at: string
}

// Order types
export interface Order {
    id?: string
    user_id?: string
    username?: string
    email?: string
    order_number: string
    total_money: number
    total_amount?: number
    discount_amount?: number
    final_amount?: number
    currency: string
    payment_method?: string
    payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
    payment_gateway?: string
    transaction_id?: string
    coupon_id?: string
    coupon?: Coupon
    notes?: string
    refund_amount?: number
    refunded_at?: string
    order_date: string
    created_at?: string
    updated_at?: string
    order_items?: OrderItem[]
    items?: OrderItem[]
}

export interface OrderItem {
    id?: string
    order_id?: string
    course_id: number
    course_type: 'GROUP' | 'INDIVIDUAL'
    course_title: string
    course_price: number
    price?: number
    discount_amount?: number
    final_price?: number
    thumbnail: string
    course?: Course
    created_at?: string
}

// Coupon types
export interface Coupon {
    id: string
    code: string
    name: string
    description?: string
    type: 'percentage' | 'fixed'
    value: number
    min_order_amount: number
    max_discount_amount?: number
    usage_limit?: number
    used_count: number
    start_date: string
    end_date?: string
    is_active: boolean
    applicable_courses?: string
    created_by?: string
    created_at: string
    updated_at: string
}

// Review types
export interface Review {
    id: string
    user_id: string
    user?: User
    course_id: string
    course?: Course
    enrollment_id: string
    rating: number
    comment?: string
    is_approved: boolean
    approved_by?: string
    approved_at?: string
    created_at: string
    updated_at: string
}

// Enrollment types
export interface Enrollment {
    id: string
    user_id: string
    user?: User
    course_id: string
    course?: Course
    order_id?: string
    enrollment_date: string
    progress: number
    completed_at?: string
    certificate_issued: boolean
    certificate_url?: string
    last_accessed?: string
    created_at: string
}

// Instructor Income types
export interface InstructorIncome {
    id: number
    year: number
    month: number
    email: string
    account_name: string
    first_name: string
    last_name: string
    bank_name: string
    bank_account: string
    total_earning: number
    payment_status: 'PENDING' | 'PAID'
    paid_at?: string
}

export interface InstructorIncomeResponse {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    has_next: boolean
    has_previous: boolean
    data: InstructorIncome[]
}
