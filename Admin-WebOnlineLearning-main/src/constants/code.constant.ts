export const HTTP_STATUS_CODES = {
    // Thành công
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Chuyển hướng
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // Lỗi từ phía khách hàng
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    TOO_MANY_REQUESTS: 429,

    // Lỗi từ phía máy chủ
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
}

export const HTTP_STATUS_MESSAGES = {
    200: '200 OK',
    201: '201 Created',
    202: '202 Accepted',
    204: '204 No Content',
    301: '301 Moved Permanently',
    302: '302 Found',
    303: '303 See Other',
    304: '304 Not Modified',
    307: '307 Temporary Redirect',
    308: '308 Permanent Redirect',
    400: '400 Bad Request',
    401: '401 Unauthorized',
    402: '402 Payment Required',
    403: '403 Forbidden',
    404: '404 Not Found',
    405: '405 Method Not Allowed',
    406: '406 Not Acceptable',
    408: '408 Request Timeout',
    409: '409 Conflict',
    410: '410 Gone',
    412: '412 Precondition Failed',
    413: '413 Payload Too Large',
    415: '415 Unsupported Media Type',
    429: '429 Too Many Requests',
    500: '500 Internal Server Error',
    501: '501 Not Implemented',
    502: '502 Bad Gateway',
    503: '503 Service Unavailable',
    504: '504 Gateway Timeout',
    505: '505 HTTP Version Not Supported',
}

export const INIT_PAY_RESPONSE_CODE = {
    SUCCESS: '00',
    FAIL: '01',
    // Dữ liệu không hợp lệ
    INVALID_DATA: '02',
    // Giao dịch đã tồn tại
    TRANSACTION_EXISTED: '03',
    //timeout
    TIMEOUT: '04',
    // Ko tìm thấy dữ liệu
    NOT_FOUND: '05',
    // Lỗi hệ thống
    SYSTEM_ERROR: '06',
    // Chữ ký không hợp lệ
    INVALID_SIGNATURE: '07',
    // Merchant service đang bị khoá
    MERCHANT_LOCKED: '08',
    // Merchant không tồn tại
    MERCHANT_NOT_FOUND: '09',
    // Bảo tri
    MAINTENANCE: '96',
    // Lỗi ko xác định
    UNDEFINED: '99',
}

export const INIT_PAY_RESPONSE_MESSAGE = {
    '00': 'Thành công',
    '01': 'Thất bại',
    '02': 'Dữ liệu không hợp lệ',
    '03': 'Giao dịch đã tồn tại',
    '04': 'Timeout',
    '05': 'Không tìm thấy dữ liệu',
    '06': 'Lỗi hệ thống',
    '07': 'Chữ ký không hợp lệ',
    '08': 'Merchant service đang bị khoá',
    '09': 'Merchant không tồn tại',
    '96': 'Bảo trì',
    '99': 'Lỗi không xác định',
}
