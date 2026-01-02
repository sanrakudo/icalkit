import { useState, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  parseICalContent,
  extractEvents,
  sortEventsByDate,
  filterEvents,
  split,
  type ICalEvent,
} from 'icalkit';

export default function Splitter() {
  const [file, setFile] = useState<File | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [chunkSize, setChunkSize] = useState(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [events, setEvents] = useState<ICalEvent[]>([]);
  const [showEventList, setShowEventList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile && selectedFile.name.endsWith('.ics')) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const parsed = parseICalContent(result);
          setTotalEvents(parsed.totalEvents);

          // Extract and sort events
          const eventList = extractEvents(parsed.vevents);
          const sorted = sortEventsByDate(eventList);

          setEvents(sorted);
        } catch (error) {
          alert(
            'iCalファイルの読み込みに失敗しました: ' + (error as Error).message,
          );
          setFile(null);
          setTotalEvents(0);
          setEvents([]);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert('.ics ファイルを選択してください');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      handleFileChange(droppedFile);
    },
    [handleFileChange],
  );

  const splitAndDownload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const content = await file.text();
      const result = await split(content, { chunkSize });

      // Create ZIP file
      const zip = new JSZip();
      result.chunks.forEach((chunk) => {
        zip.file(chunk.fileName, chunk.content);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `calendar_split_${result.chunks.length}_files.zip`);
    } catch (error) {
      alert('分割処理に失敗しました: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const numFiles = totalEvents > 0 ? Math.ceil(totalEvents / chunkSize) : 0;

  const filteredEvents = useMemo(() => {
    return filterEvents(events, searchQuery);
  }, [events, searchQuery]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/icalkit-icon.svg"
              alt="iCalKit Logo"
              className="w-12 h-12"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              iCalKit Splitter
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            大きなiCalファイルを分割して、Googleカレンダーに簡単インポート
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              iCalファイルをドロップ
            </p>
            <p className="text-gray-500 mb-4">または</p>
            <label className="inline-block">
              <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg font-medium">
                ファイルを選択
              </span>
              <input
                type="file"
                accept=".ics"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {file && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-indigo-800 font-medium">📄 {file.name}</p>
              </div>
            )}
          </div>
        </div>

        {totalEvents > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label
                  htmlFor="chunk-size-slider"
                  className="text-lg font-semibold text-gray-700"
                >
                  1ファイルあたりのイベント数
                </label>
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {chunkSize}
                </span>
              </div>
              <input
                id="chunk-size-slider"
                type="range"
                min="50"
                max="1000"
                step="50"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>50</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                <p className="text-gray-600 text-sm mb-2">総イベント数</p>
                <p className="text-4xl font-bold text-indigo-600">
                  {totalEvents.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                <p className="text-gray-600 text-sm mb-2">分割後のファイル数</p>
                <p className="text-4xl font-bold text-purple-600">
                  {numFiles.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={splitAndDownload}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-6 w-6 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  処理中...
                </span>
              ) : (
                `✨ ${numFiles}個のファイルに分割してダウンロード`
              )}
            </button>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          <p className="mb-2">
            💡 Googleカレンダーの推奨インポートサイズは500イベント以下です
          </p>
          <p>分割されたファイルは.zip形式でダウンロードされます</p>
        </div>

        {totalEvents > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
            <button
              onClick={() => setShowEventList(!showEventList)}
              className="w-full flex items-center justify-between text-left mb-4"
            >
              <h2 className="text-2xl font-bold text-gray-800">
                📅 イベント一覧
              </h2>
              <svg
                className={`w-6 h-6 text-gray-600 transition-transform ${
                  showEventList ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showEventList && (
              <div className="space-y-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔍 イベントを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {filteredEvents.length} / {totalEvents} イベント
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {event.summary}
                      </h3>
                      {event.startDate && (
                        <p className="text-sm text-gray-600 mb-1">
                          🕐 {formatDate(event.startDate)}
                          {event.endDate &&
                            event.endDate.getTime() !==
                              event.startDate.getTime() &&
                            ` → ${formatDate(event.endDate)}`}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
