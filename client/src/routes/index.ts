import { lazy } from 'react';

export const routes = [
    {
        id: 'home',
        paths: ['/home'],
        exact: true,
        component: lazy(() => import('../components/home/Home')),
        requiresAuth: true,
    },
    {
        id: 'dashboard',
        paths: ['/dashboard'],
        exact: true,
        component: lazy(() => import('../components/dashboard/Dashboard')),
        requiresAuth: true,
    },
    {
        id: 'landing',
        paths: ['/welcome', '/logout'],
        exact: true,
        component: lazy(() => import('../components/layout/Landing')),
        requiresAuth: false,
    },
];
