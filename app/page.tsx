'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Send, Copy, Smartphone, Monitor } from 'lucide-react';

export default function SmartBridge() {
  const [roomCode, setRoomCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [content, setContent] = useState('');
  const [receivedData, setReceivedData] = useState('');

  /**
   * Listen for real-time events when joined a room
   */
  useEffect(() => {
    if (!isJoined || !roomCode) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`room-${roomCode}`);
    
    channel.bind('on-sync', (data: { message: string }) => {
      setReceivedData(data.message);
    });

    return () => {
      pusher.unsubscribe(`room-${roomCode}`);
      pusher.disconnect();
    };
  }, [isJoined, roomCode]);

  const handleSync = async () => {
    if (!content) return;
    await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ roomCode, content }),
    });
    setContent('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(receivedData);
    alert('Đã copy vào bộ nhớ tạm!');
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Kết nối thiết bị</h1>
          <input
            type="text"
            placeholder="Nhập mã phòng (VD: 1234)"
            className="w-full p-4 mb-4 border rounded-xl text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
            value={roomCode}
            required
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            onClick={() => setIsJoined(true)}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Bắt đầu đồng bộ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium text-gray-500">Phòng: <span className="text-blue-600">{roomCode}</span></div>
        <button onClick={() => setIsJoined(false)} className="text-sm text-red-500">Thoát</button>
      </div>

      {/* Ô gửi dữ liệu */}
      <div className="mb-8">
        <textarea
          className="w-full p-4 border rounded-2xl h-40 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
          placeholder="Dán nội dung cần gửi vào đây..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={handleSync}
          className="flex items-center justify-center w-full gap-2 bg-green-600 text-white p-4 rounded-xl font-semibold"
        >
          <Send size={20} /> Gửi tới thiết bị kia
        </button>
      </div>

      {/* Ô nhận dữ liệu */}
      {receivedData && (
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-blue-800 uppercase">Dữ liệu vừa nhận:</span>
            <button onClick={copyToClipboard} className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50">
              <Copy size={18} className="text-blue-600" />
            </button>
          </div>
          <p className="text-gray-700 break-words whitespace-pre-wrap">{receivedData}</p>
        </div>
      )}
    </div>
  );
}