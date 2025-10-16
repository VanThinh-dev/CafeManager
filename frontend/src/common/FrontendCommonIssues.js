export const handleFrontendError = (error) => {
    if (!error.response) {
        alert('⚠️ Không thể kết nối đến server!');
        return;
    }


    const { status, data } = error.response;
    switch (status) {
        case 400:
            alert('❌ Dữ liệu không hợp lệ!');
            break;
        case 401:
            alert('🚫 Bạn cần đăng nhập để tiếp tục!');
            break;
        case 404:
            alert('🔍 Không tìm thấy dữ liệu!');
            break;
        case 500:
            alert(`💥 Lỗi server: ${data.error}`);
            break;
        default:
            alert('⚠️ Lỗi không xác định!');
    }
};