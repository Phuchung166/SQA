import ApiService from './ApiService'

// Get orders (admin)
export async function apiGetOrders(params?: any) {
    return ApiService.fetchData({
        url: '/orders/admin',
        method: 'get',
        params,
    })
}

// Get order details by order number
export async function apiGetOrder(orderNumber: string) {
    return ApiService.fetchData({
        url: `/orders/${orderNumber}`,
        method: 'get',
    })
}

// Refund order
export async function apiRefundOrder(
    orderId: string,
    data?: { amount?: number; reason?: string }
) {
    return ApiService.fetchData({
        url: `/orders/${orderId}/refund`,
        method: 'post',
        data,
    })
}

// Export orders
export async function apiExportOrders(params?: any) {
    return ApiService.fetchData({
        url: '/orders/export',
        method: 'get',
        params,
        responseType: 'blob', // For file download
    })
}

// Get order statistics
export async function apiGetOrderStats(params?: any) {
    return ApiService.fetchData({
        url: '/orders/stats',
        method: 'get',
        params,
    })
}
