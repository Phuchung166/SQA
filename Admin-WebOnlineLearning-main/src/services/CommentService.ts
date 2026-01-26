import ApiService from './ApiService'

export async function apiGetComments() {
    return ApiService.fetchData({
        url: '/comment/list?cms=true',
        method: 'get',
    })
}

export async function apiDeleteComment(commentId: number) {
    return ApiService.fetchData({
        url: `/comment/remove?i=${commentId}`,
        method: 'post',
    })
}

export async function apiUpdateCommentStatus(
    commentId: number,
    status: boolean
) {
    return ApiService.fetchData({
        url: `/comment/updateStatus?i=${commentId}&s=${status}`,
        method: 'post',
    })
}
