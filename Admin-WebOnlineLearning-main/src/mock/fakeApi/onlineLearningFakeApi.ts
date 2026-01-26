import { Server, Response } from 'miragejs'
import { faker } from '@faker-js/faker'
import {
    fakeRoles,
    fakePermissions,
    fakeInstructors,
    fakeCategories,
    fakeCourses,
    fakeStudents,
    fakeOrders,
    fakeCoupons,
    fakeReviews,
} from '../data/onlineLearningData'
import dayjs from 'dayjs'

export default function onlineLearningFakeApi(server: Server) {
    // Roles API
    server.get('/api/roles', () => {
        return { code: 0, data: fakeRoles }
    })

    server.post('/api/roles', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newRole = {
            id: fakeRoles.length + 1,
            ...attrs,
            created_at: new Date().toISOString(),
        }
        fakeRoles.push(newRole)
        return { code: 0, data: newRole }
    })

    server.put('/api/roles/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        const roleIndex = fakeRoles.findIndex((role) => role.id === id)
        if (roleIndex !== -1) {
            fakeRoles[roleIndex] = { ...fakeRoles[roleIndex], ...attrs }
            return { code: 0, data: fakeRoles[roleIndex] }
        }
        return new Response(404, {}, { code: 404, message: 'Role not found' })
    })

    server.del('/api/roles/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const roleIndex = fakeRoles.findIndex((role) => role.id === id)
        if (roleIndex !== -1) {
            fakeRoles.splice(roleIndex, 1)
            return { code: 0, message: 'Role deleted successfully' }
        }
        return new Response(404, {}, { code: 404, message: 'Role not found' })
    })

    // Permissions API
    server.get('/api/permissions', () => {
        return { code: 0, data: fakePermissions }
    })

    // Instructors API
    server.get('/api/instructors', (schema, request) => {
        const {
            page = 1,
            pageSize = 10,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = request.queryParams
        let filteredInstructors = [...fakeInstructors]

        // Filter by status
        if (status && typeof status === 'string') {
            filteredInstructors = filteredInstructors.filter(
                (instructor) => instructor.approval_status === status
            )
        }

        // Filter by search
        if (search && typeof search === 'string') {
            filteredInstructors = filteredInstructors.filter(
                (instructor) =>
                    instructor.user?.fullName
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                    instructor.user?.email
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                    instructor.expertise
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
            )
        }

        // Sort
        if (typeof sortBy === 'string') {
            filteredInstructors.sort((a, b) => {
                let aValue, bValue
                switch (sortBy) {
                    case 'fullName':
                        aValue = a.user?.fullName || ''
                        bValue = b.user?.fullName || ''
                        break
                    case 'courseCount':
                        aValue = a.total_courses
                        bValue = b.total_courses
                        break
                    case 'rating':
                        aValue = 4.5 // Mock rating
                        bValue = 4.2 // Mock rating
                        break
                    case 'createdAt':
                    default:
                        aValue = new Date(a.created_at).getTime()
                        bValue = new Date(b.created_at).getTime()
                        break
                }

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1
                } else {
                    return aValue < bValue ? 1 : -1
                }
            })
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(pageSize))
        const endIndex = startIndex + parseInt(String(pageSize))
        const paginatedData = filteredInstructors.slice(startIndex, endIndex)

        return {
            success: true,
            data: {
                instructors: paginatedData.map((instructor) => ({
                    ...instructor,
                    rating: 4.5, // Mock rating
                    reviewCount: faker.number.int({ min: 0, max: 100 }),
                })),
                total: filteredInstructors.length,
                page: parseInt(String(page)),
                pageSize: parseInt(String(pageSize)),
            },
        }
    })

    server.get('/api/instructors/:id', (schema, request) => {
        const id = request.params.id
        const instructor = fakeInstructors.find((i) => i.id === id)

        if (!instructor) {
            return new Response(
                404,
                {},
                {
                    success: false,
                    message: 'Instructor not found',
                }
            )
        }

        return {
            success: true,
            data: {
                ...instructor,
                rating: 4.5,
                reviewCount: faker.number.int({ min: 0, max: 100 }),
                education: [
                    {
                        degree: 'Bachelor of Computer Science',
                        institution: 'University of Technology',
                        year: 2018,
                    },
                ],
                experience: [
                    {
                        title: 'Senior Developer',
                        company: 'Tech Company',
                        duration: '2020-2023',
                    },
                ],
                certifications: ['AWS Certified', 'React Expert'],
            },
        }
    })

    server.put('/api/instructors/:id/approve', (schema, request) => {
        const id = request.params.id
        const instructorIndex = fakeInstructors.findIndex(
            (instructor) => instructor.id === id
        )
        if (instructorIndex !== -1) {
            fakeInstructors[instructorIndex].approval_status = 'approved'
            fakeInstructors[instructorIndex].approval_date =
                new Date().toISOString()
            return {
                success: true,
                message: 'Instructor approved successfully',
                data: {
                    id: fakeInstructors[instructorIndex].id,
                    status: 'approved',
                    approvedAt: fakeInstructors[instructorIndex].approval_date,
                },
            }
        }
        return new Response(
            404,
            {},
            { success: false, message: 'Instructor not found' }
        )
    })

    server.put('/api/instructors/:id/reject', (schema, request) => {
        const id = request.params.id
        const attrs = JSON.parse(request.requestBody)
        const instructorIndex = fakeInstructors.findIndex(
            (instructor) => instructor.id === id
        )
        if (instructorIndex !== -1) {
            fakeInstructors[instructorIndex].approval_status = 'rejected'
            const rejectedAt = new Date().toISOString()
            return {
                success: true,
                message: 'Instructor rejected successfully',
                data: {
                    id: fakeInstructors[instructorIndex].id,
                    status: 'rejected',
                    rejectedAt,
                    rejectionReason: attrs.reason || '',
                },
            }
        }
        return new Response(
            404,
            {},
            { success: false, message: 'Instructor not found' }
        )
    })

    server.put('/api/instructors/:id/suspend', (schema, request) => {
        const id = request.params.id
        const attrs = JSON.parse(request.requestBody)
        const instructorIndex = fakeInstructors.findIndex(
            (instructor) => instructor.id === id
        )
        if (instructorIndex !== -1) {
            if (fakeInstructors[instructorIndex].user) {
                fakeInstructors[instructorIndex].user!.status = 'inactive'
            }
            const suspendedAt = new Date().toISOString()
            return {
                success: true,
                message: 'Instructor suspended successfully',
                data: {
                    id: fakeInstructors[instructorIndex].id,
                    status: 'suspended',
                    suspendedAt,
                    suspensionReason: attrs.reason || '',
                },
            }
        }
        return new Response(
            404,
            {},
            { success: false, message: 'Instructor not found' }
        )
    })

    server.put('/api/instructors/:id/activate', (schema, request) => {
        const id = request.params.id
        const instructorIndex = fakeInstructors.findIndex(
            (instructor) => instructor.id === id
        )
        if (instructorIndex !== -1) {
            if (fakeInstructors[instructorIndex].user) {
                fakeInstructors[instructorIndex].user!.status = 'active'
            }
            const activatedAt = new Date().toISOString()
            return {
                success: true,
                message: 'Instructor activated successfully',
                data: {
                    id: fakeInstructors[instructorIndex].id,
                    status: 'active',
                    activatedAt,
                },
            }
        }
        return new Response(
            404,
            {},
            { success: false, message: 'Instructor not found' }
        )
    })

    server.put('/api/instructors/:id', (schema, request) => {
        const id = request.params.id
        const attrs = JSON.parse(request.requestBody)
        const instructorIndex = fakeInstructors.findIndex(
            (instructor) => instructor.id === id
        )
        if (instructorIndex !== -1) {
            fakeInstructors[instructorIndex] = {
                ...fakeInstructors[instructorIndex],
                ...attrs,
                updated_at: new Date().toISOString(),
            }
            return {
                success: true,
                message: 'Instructor updated successfully',
                data: {
                    id: fakeInstructors[instructorIndex].id,
                    fullName: fakeInstructors[instructorIndex].user?.fullName,
                    updatedAt: fakeInstructors[instructorIndex].updated_at,
                },
            }
        }
        return new Response(
            404,
            {},
            { success: false, message: 'Instructor not found' }
        )
    })

    server.get('/api/instructors/:id/courses', (schema, request) => {
        const id = request.params.id
        const { page = 1, pageSize = 10, status } = request.queryParams

        let instructorCourses = fakeCourses.filter(
            (course) => course.instructor_id === id
        )

        if (status && typeof status === 'string') {
            instructorCourses = instructorCourses.filter(
                (course) => course.status === status
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(pageSize))
        const endIndex = startIndex + parseInt(String(pageSize))
        const paginatedData = instructorCourses.slice(startIndex, endIndex)

        return {
            success: true,
            data: {
                courses: paginatedData.map((course) => ({
                    id: course.id,
                    title: course.title,
                    thumbnail: course.thumbnail,
                    price: course.price,
                    status: course.status,
                    enrollmentCount: course.total_students,
                    rating: course.avg_rating,
                    createdAt: course.created_at,
                })),
                total: instructorCourses.length,
                page: parseInt(String(page)),
                pageSize: parseInt(String(pageSize)),
            },
        }
    })

    // Categories API
    server.get('/api/categories', (schema, request) => {
        const {
            page = 1,
            pageSize = 10,
            search,
            parent,
            status,
        } = request.queryParams
        let filteredCategories = [...fakeCategories]

        // Filter by status
        if (status && typeof status === 'string') {
            filteredCategories = filteredCategories.filter((category) =>
                status === 'active' ? category.is_active : !category.is_active
            )
        }

        // Filter by parent
        if (parent && typeof parent === 'string') {
            if (parent === 'null' || parent === '') {
                filteredCategories = filteredCategories.filter(
                    (category) => !category.parent_id
                )
            } else {
                filteredCategories = filteredCategories.filter(
                    (category) => category.parent_id === parseInt(parent)
                )
            }
        }

        // Filter by search
        if (search && typeof search === 'string') {
            filteredCategories = filteredCategories.filter(
                (category) =>
                    category.name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    (category.description &&
                        category.description
                            .toLowerCase()
                            .includes(search.toLowerCase()))
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(pageSize))
        const endIndex = startIndex + parseInt(String(pageSize))
        const paginatedData = filteredCategories.slice(startIndex, endIndex)

        return {
            success: true,
            data: {
                categories: paginatedData,
                total: filteredCategories.length,
                page: parseInt(String(page)),
                pageSize: parseInt(String(pageSize)),
            },
        }
    })

    server.get('/api/categories/tree', () => {
        // Build tree structure
        interface TreeNode {
            id: number
            name: string
            slug: string
            parentId: number | null
            children: TreeNode[]
        }

        const buildTree = (parentId: number | null = null): TreeNode[] => {
            return fakeCategories
                .filter((cat) => cat.parent_id === parentId && cat.is_active)
                .map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    parentId: cat.parent_id,
                    children: buildTree(cat.id),
                }))
        }

        return {
            success: true,
            data: buildTree(),
        }
    })

    server.get('/api/categories/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const category = fakeCategories.find((cat) => cat.id === id)

        if (!category) {
            return new Response(
                404,
                {},
                {
                    success: false,
                    message: 'Category not found',
                }
            )
        }

        // Get parent info
        const parent = category.parent_id
            ? fakeCategories.find((cat) => cat.id === category.parent_id)
            : null

        // Get children
        const children = fakeCategories
            .filter((cat) => cat.parent_id === category.id)
            .map((cat) => ({ id: cat.id, name: cat.name }))

        return {
            success: true,
            data: {
                ...category,
                parent: parent ? { id: parent.id, name: parent.name } : null,
                children,
            },
        }
    })

    server.post('/api/categories', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)

        // Generate slug if not provided
        const slug =
            attrs.slug ||
            attrs.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

        const newCategory = {
            id: Math.max(...fakeCategories.map((c) => c.id)) + 1,
            name: attrs.name,
            slug,
            description: attrs.description || '',
            image: attrs.image || null,
            parent_id: attrs.parent_id || null,
            parent_name: undefined as string | undefined,
            sort_order: attrs.sort_order || 0,
            is_active: attrs.status === 'active' || attrs.is_active !== false,
            course_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        // Add parent_name if has parent
        if (newCategory.parent_id) {
            const parent = fakeCategories.find(
                (cat) => cat.id === newCategory.parent_id
            )
            if (parent) {
                newCategory.parent_name = parent.name
            }
        }

        fakeCategories.push(newCategory)

        return {
            success: true,
            message: 'Category created successfully',
            data: {
                id: newCategory.id,
                name: newCategory.name,
                slug: newCategory.slug,
            },
        }
    })

    server.put('/api/categories/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        const categoryIndex = fakeCategories.findIndex((cat) => cat.id === id)

        if (categoryIndex === -1) {
            return new Response(
                404,
                {},
                {
                    success: false,
                    message: 'Category not found',
                }
            )
        }

        // Update category
        const updatedCategory = {
            ...fakeCategories[categoryIndex],
            ...attrs,
            updated_at: new Date().toISOString(),
        }

        // Update parent_name if parent_id changed
        if (attrs.parent_id !== undefined) {
            if (attrs.parent_id) {
                const parent = fakeCategories.find(
                    (cat) => cat.id === attrs.parent_id
                )
                updatedCategory.parent_name = parent ? parent.name : undefined
            } else {
                updatedCategory.parent_name = undefined
            }
        }

        // Handle status field
        if (attrs.status !== undefined) {
            updatedCategory.is_active = attrs.status === 'active'
        }

        fakeCategories[categoryIndex] = updatedCategory

        return {
            success: true,
            message: 'Category updated successfully',
            data: {
                id: updatedCategory.id,
                name: updatedCategory.name,
                updatedAt: updatedCategory.updated_at,
            },
        }
    })

    server.del('/api/categories/:id', (schema, request) => {
        const id = parseInt(request.params.id)
        const categoryIndex = fakeCategories.findIndex((cat) => cat.id === id)

        if (categoryIndex === -1) {
            return new Response(
                404,
                {},
                {
                    success: false,
                    message: 'Category not found',
                }
            )
        }

        const category = fakeCategories[categoryIndex]

        // Check if category has courses
        if (category.course_count && category.course_count > 0) {
            return new Response(
                400,
                {},
                {
                    success: false,
                    message: 'Cannot delete category with courses',
                }
            )
        }

        // Check if category has children
        const hasChildren = fakeCategories.some((cat) => cat.parent_id === id)
        if (hasChildren) {
            return new Response(
                400,
                {},
                {
                    success: false,
                    message: 'Cannot delete category with subcategories',
                }
            )
        }

        fakeCategories.splice(categoryIndex, 1)

        return {
            success: true,
            message: 'Category deleted successfully',
        }
    })

    // Courses API
    server.get('/api/courses', (schema, request) => {
        const {
            page = 1,
            limit = 10,
            status,
            category_id,
            instructor_id,
            search,
        } = request.queryParams
        let filteredCourses = [...fakeCourses]

        if (status && typeof status === 'string') {
            filteredCourses = filteredCourses.filter(
                (course) => course.status === status
            )
        }

        if (category_id && typeof category_id === 'string') {
            filteredCourses = filteredCourses.filter(
                (course) => course.category_id === parseInt(category_id)
            )
        }

        if (instructor_id && typeof instructor_id === 'string') {
            filteredCourses = filteredCourses.filter(
                (course) => course.instructor_id === instructor_id
            )
        }

        if (search && typeof search === 'string') {
            filteredCourses = filteredCourses.filter(
                (course) =>
                    course.title.toLowerCase().includes(search.toLowerCase()) ||
                    course.description
                        .toLowerCase()
                        .includes(search.toLowerCase())
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(limit))
        const endIndex = startIndex + parseInt(String(limit))
        const paginatedData = filteredCourses.slice(startIndex, endIndex)

        return {
            code: 0,
            data: {
                list: paginatedData,
                total: filteredCourses.length,
                page: parseInt(String(page)),
                limit: parseInt(String(limit)),
            },
        }
    })

    // Students API
    server.get('/api/students', (schema, request) => {
        const { page = 1, limit = 10, status, search } = request.queryParams
        let filteredStudents = [...fakeStudents]

        if (status && typeof status === 'string') {
            filteredStudents = filteredStudents.filter(
                (student) => student.status === status
            )
        }

        if (search && typeof search === 'string') {
            filteredStudents = filteredStudents.filter(
                (student) =>
                    `${student.first_name || ''} ${student.last_name || ''}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    student.email?.toLowerCase().includes(search.toLowerCase())
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(limit))
        const endIndex = startIndex + parseInt(String(limit))
        const paginatedData = filteredStudents.slice(startIndex, endIndex)

        return {
            code: 0,
            data: {
                list: paginatedData,
                total: filteredStudents.length,
                page: parseInt(String(page)),
                limit: parseInt(String(limit)),
            },
        }
    })

    // Orders API
    server.get('/api/orders', (schema, request) => {
        const {
            page = 1,
            limit = 10,
            status,
            payment_method,
            date_from,
            date_to,
        } = request.queryParams
        let filteredOrders = [...fakeOrders]

        if (status && typeof status === 'string') {
            filteredOrders = filteredOrders.filter(
                (order) => order.payment_status === status
            )
        }

        if (payment_method && typeof payment_method === 'string') {
            filteredOrders = filteredOrders.filter(
                (order) => order.payment_method === payment_method
            )
        }

        if (date_from && typeof date_from === 'string') {
            filteredOrders = filteredOrders.filter((order) =>
                dayjs(order.created_at).isAfter(dayjs(date_from))
            )
        }

        if (date_to && typeof date_to === 'string') {
            filteredOrders = filteredOrders.filter((order) =>
                dayjs(order.created_at).isBefore(dayjs(date_to))
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(limit))
        const endIndex = startIndex + parseInt(String(limit))
        const paginatedData = filteredOrders.slice(startIndex, endIndex)

        return {
            code: 0,
            data: {
                list: paginatedData,
                total: filteredOrders.length,
                page: parseInt(String(page)),
                limit: parseInt(String(limit)),
            },
        }
    })

    // Coupons API
    server.get('/api/coupons', () => {
        return { code: 0, data: fakeCoupons }
    })

    server.post('/api/coupons', (schema, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newCoupon = {
            id: Math.random().toString(36).substr(2, 9),
            ...attrs,
            used_count: 0,
            created_at: new Date().toISOString(),
        }
        fakeCoupons.push(newCoupon)
        return { code: 0, data: newCoupon }
    })

    // Reviews API
    server.get('/api/reviews', (schema, request) => {
        const {
            page = 1,
            limit = 10,
            is_approved,
            course_id,
            rating,
        } = request.queryParams
        let filteredReviews = [...fakeReviews]

        if (is_approved !== undefined) {
            filteredReviews = filteredReviews.filter(
                (review) => review.is_approved === (is_approved === 'true')
            )
        }

        if (course_id && typeof course_id === 'string') {
            filteredReviews = filteredReviews.filter(
                (review) => review.course_id === course_id
            )
        }

        if (rating && typeof rating === 'string') {
            filteredReviews = filteredReviews.filter(
                (review) => review.rating === parseInt(rating)
            )
        }

        const startIndex =
            (parseInt(String(page)) - 1) * parseInt(String(limit))
        const endIndex = startIndex + parseInt(String(limit))
        const paginatedData = filteredReviews.slice(startIndex, endIndex)

        return {
            code: 0,
            data: {
                list: paginatedData,
                total: filteredReviews.length,
                page: parseInt(String(page)),
                limit: parseInt(String(limit)),
            },
        }
    })

    server.put('/api/reviews/:id/approve', (schema, request) => {
        const id = request.params.id
        const reviewIndex = fakeReviews.findIndex((review) => review.id === id)
        if (reviewIndex !== -1) {
            fakeReviews[reviewIndex].is_approved = true
            fakeReviews[reviewIndex].approved_at = new Date().toISOString()
            return { code: 0, data: fakeReviews[reviewIndex] }
        }
        return new Response(404, {}, { code: 404, message: 'Review not found' })
    })

    // Analytics API
    server.get('/api/analytics/dashboard', () => {
        return {
            code: 0,
            data: {
                total_users: fakeStudents.length + fakeInstructors.length,
                total_instructors: fakeInstructors.length,
                total_courses: fakeCourses.length,
                total_orders: fakeOrders.length,
                total_revenue: fakeOrders.reduce(
                    (sum, order) => sum + order.final_amount,
                    0
                ),
                pending_instructors: fakeInstructors.filter(
                    (i) => i.approval_status === 'pending'
                ).length,
                pending_reviews: fakeReviews.filter((r) => !r.is_approved)
                    .length,
                active_courses: fakeCourses.filter(
                    (c) => c.status === 'published'
                ).length,
            },
        }
    })

    server.get('/api/analytics/revenue', () => {
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: Math.floor(Math.random() * 50000000) + 10000000,
        }))

        return {
            code: 0,
            data: {
                monthly_revenue: monthlyRevenue,
                total_revenue: monthlyRevenue.reduce(
                    (sum, item) => sum + item.revenue,
                    0
                ),
                growth_rate: 12.5,
            },
        }
    })
}
