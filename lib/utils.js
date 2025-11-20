/**
 * 格式化日期为本地化字符串
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // 如果是今天的日期，显示"今天 HH:MM"
  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
  
  if (isToday) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // 如果是昨天的日期，显示"昨天 HH:MM"
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();
  
  if (isYesterday) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // 如果是今年的日期，不显示年份
  const isThisYear = date.getFullYear() === today.getFullYear();
  
  if (isThisYear) {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 其他日期显示完整日期
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }) + 
         ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 将文本截断到指定长度
 * @param {string} text - 要截断的文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 生成随机颜色
 * @returns {string} 十六进制颜色代码
 */
export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * 从字符串生成稳定的颜色
 * @param {string} str - 输入字符串
 * @returns {string} 十六进制颜色代码
 */
export function stringToColor(str) {
  if (!str) return '#888888';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * 从HTML字符串中提取纯文本
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本
 */
export function htmlToText(html) {
  if (!html) return '';
  
  // 创建一个临时DOM元素
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * 休眠函数
 * @param {number} ms - 毫秒数
 * @returns {Promise} 延迟Promise
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 