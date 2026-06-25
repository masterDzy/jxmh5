'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { get, put } from '@/lib/http';
import { getGuestId } from '@/lib/guest';

// ==================== 类型定义 ====================

interface Message {
  id: string;
  sender_type: string;
  sender_id: string;
  receiver_type: string;
  receiver_id: string;
  msg_type: 'system' | 'chat';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface MessagesData {
  items: Message[];
  total: number;
  unread: number;
}

// ==================== 时间格式化 ====================

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 今天：显示时间
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (diffDays === 1) {
    return '昨天';
  }
  if (diffDays < 7 && today.getDay() !== target.getDay()) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[target.getDay()];
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// ==================== 页面组件 ====================

export default function MessagesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'system' | 'chat'>('system');
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const guestId = typeof window !== 'undefined' ? getGuestId() : null;

  // ==================== 获取消息列表 ====================

  const fetchMessages = useCallback(async (isRefresh = false) => {
    if (!guestId) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const msgType = tab === 'system' ? 'system' : 'chat';
      const data = await get<MessagesData>(
        '/api/v1/messages',
        {
          receiver_type: 'guest',
          receiver_id: guestId,
          msg_type: msgType,
          page: 1,
          page_size: 50,
        }
      );

      if (data.error === false && data.data) {
        setMessages(data.data.items || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      // 静默处理网络错误
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guestId, tab]);

  // ==================== 获取未读数量 ====================

  const fetchUnreadCount = useCallback(async () => {
    if (!guestId) return;

    try {
      const data = await get<{ count: number }>(
        '/api/v1/messages/unread-count',
        {
          receiver_type: 'guest',
          receiver_id: guestId,
        }
      );

      if (data.error === false && data.data) {
        setUnreadCount(data.data.count);
      }
    } catch {
      // 静默处理
    }
  }, [guestId]);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [fetchMessages, fetchUnreadCount]);

  // ==================== 标记已读 ====================

  const handleMarkRead = async (message: Message) => {
    if (message.is_read) return;

    try {
      const data = await put<{ success: boolean }>(
        `/api/v1/messages/${message.id}/read`
      );

      if (data.error === false && data.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        );
        // 减少未读计数
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // 静默处理
    }
  };

  // ==================== 下拉刷新 ====================

  const handleRefresh = () => {
    fetchMessages(true);
    fetchUnreadCount();
  };

  // ==================== 切换标签 ====================

  const handleTabChange = (newTab: 'system' | 'chat') => {
    if (tab === newTab) return;
    setTab(newTab);
  };

  // ==================== 渲染 ====================

  return (
    <div
      className="jm-msg-page"
      style={{ '--page-theme-color': 'var(--jm-color-brand-rose, #da2e75)' } as React.CSSProperties}
    >
      {/* 头部 */}
      <header className="jm-msg-header">
        <button
          className="jm-msg-back"
          onClick={() => router.back()}
          aria-label="返回"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="jm-msg-header__title">消息通知</h1>
      </header>

      {/* 标签切换 */}
      <div className="jm-msg-tabs">
        <button
          className={`jm-msg-tab${tab === 'system' ? ' jm-msg-tab--active' : ''}`}
          onClick={() => handleTabChange('system')}
        >
          系统通知
          {unreadCount > 0 && (
            <span className="jm-msg-tab__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        <button
          className={`jm-msg-tab${tab === 'chat' ? ' jm-msg-tab--active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          客服对话
          {unreadCount > 0 && (
            <span className="jm-msg-tab__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* 消息列表 */}
      <div className="jm-msg-list">
        {loading ? (
          <div className="jm-msg-empty">
            <div
              className="jm-product-grid__spinner"
              style={{ margin: '0 0 16px' }}
            />
            <span className="jm-msg-empty__text">加载中...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="jm-msg-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="#e0e0e0"/>
              <path d="M11 13h2v-2h-2v2zm0-4h2V7h-2v2z" fill="#e0e0e0"/>
            </svg>
            <span className="jm-msg-empty__text">暂无消息</span>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`jm-msg-item${!msg.is_read ? ' jm-msg-item--unread' : ''}`}
                onClick={() => handleMarkRead(msg)}
              >
                {/* 图标 */}
                <div className="jm-msg-item__icon">
                  {msg.msg_type === 'system' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--page-theme-color, #da2e75)">
                      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
                    </svg>
                  )}
                </div>

                {/* 消息主体 */}
                <div className="jm-msg-item__body">
                  <div className="jm-msg-item__top">
                    <span className={`jm-msg-item__title${!msg.is_read ? ' jm-msg-item__title--unread' : ''}`}>
                      {msg.title || (msg.msg_type === 'system' ? '系统通知' : '客服消息')}
                    </span>
                    <span className="jm-msg-item__time">
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  <div className="jm-msg-item__preview">
                    {msg.content ? msg.content.slice(0, 50) : ''}
                  </div>
                </div>

                {/* 未读红点 */}
                {!msg.is_read && <span className="jm-msg-item__unread-dot" />}
              </div>
            ))}

            {/* 下拉加载更多 */}
            {messages.length < total && (
              <button
                className="w-full h-[44px] flex items-center justify-center bg-transparent border-none cursor-pointer text-sm jm-muted"
                onClick={() => fetchMessages(true)}
              >
                {refreshing ? '加载中...' : '加载更多'}
              </button>
            )}

            {/* 总数提示 */}
            {total > 0 && (
              <div className="text-center py-4">
                <span className="text-xs jm-muted">
                  {messages.length >= total
                    ? `共 ${total} 条消息`
                    : `已加载 ${messages.length}/${total} 条`}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 刷新按钮 */}
      {!loading && (
        <button
          onClick={handleRefresh}
          className="fixed bottom-[calc(40px+env(safe-area-inset-bottom))] right-4 w-10 h-10 rounded-full bg-white shadow-md border border-[#f0f0f0] flex items-center justify-center cursor-pointer"
          aria-label="刷新"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className={refreshing ? 'animate-spin' : ''}
          >
            <path
              d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill="#999"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
