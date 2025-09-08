/**
 * Utility functions for avatar generation and display
 */

/**
 * Tạo avatar chữ cái đầu tên với nền xanh
 * @param name - Tên người dùng
 * @returns Chữ cái đầu tên viết hoa
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return 'U'; // Default fallback
  }
  
  // Lấy chữ cái đầu của từng từ trong tên
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  // Nếu có nhiều từ, lấy chữ cái đầu của từ đầu và từ cuối
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
};

/**
 * Tạo màu nền cho avatar dựa trên tên
 * @param _name - Tên người dùng (hiện tại không sử dụng, luôn trả về màu xanh)
 * @returns CSS class cho màu nền
 */
export const getAvatarBackgroundColor = (_name: string): string => {
  // Sử dụng màu xanh như trong hình mẫu
  return 'bg-teal-600';
};


