import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
import { ADMIN, SUPER_ADMIN, INSTRUCTOR } from '@/constants/roles.constant'
import { lazy } from 'react'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'profile',
        path: '/account/settings/:tab',
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        meta: {
            header: 'Thông tin cá nhân',
            headerContainer: true,
        },
    },
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(() => import('@/views/pages/AccessDenied')),
        authority: [ADMIN],
    },
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/dashboard')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'roles',
        path: '/roles',
        component: lazy(() => import('@/views/roles')),
        authority: [SUPER_ADMIN],
    },
    {
        key: 'instructors',
        path: '/instructors',
        component: lazy(() => import('@/views/instructors')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'categories',
        path: '/categories',
        component: lazy(() => import('@/views/categories')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'courses',
        path: '/courses',
        component: lazy(() => import('@/views/courses')),
        authority: [ADMIN, SUPER_ADMIN, INSTRUCTOR],
    },
    {
        key: 'students',
        path: '/students',
        component: lazy(() => import('@/views/students')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'orders',
        path: '/orders',
        component: lazy(() => import('@/views/orders')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'instructor-income-monthly',
        path: '/instructor-income-monthly',
        component: lazy(() => import('@/views/instructor-income-monthly')),
        authority: [ADMIN, SUPER_ADMIN],
    },
    {
        key: 'analytics',
        path: '/analytics',
        component: lazy(() => import('@/views/analytics')),
        authority: [ADMIN, SUPER_ADMIN],
    },
]
