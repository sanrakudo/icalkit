import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { saveAs } from 'file-saver';
import {
  merge,
  parseICalContent,
  extractEvents,
  sortEventsByDate,
  filterEvents,
  type DuplicateHandling,
  type MergeResult,
  type ICalEvent,
} from 'icalkit';
import PageHeader from '../components/PageHeader';
import FileDropZone from '../components/FileDropZone';

// Extended event type with source file info
interface EventWithSource extends ICalEvent {
  sourceIndex: number;
  sourceName: string;
  isDuplicate: boolean;
  isOriginal: boolean; // true if this is the first occurrence of a duplicate
  duplicateOf?: number; // sourceIndex of the original (for duplicates)
}

// Colors for source file badges
const SOURCE_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
];

export default function Merger() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<
    Array<{ name: string; content: string; eventCount: number }>
  >([]);
  const [allEvents, setAllEvents] = useState<EventWithSource[]>([]);
  const [duplicateHandling, setDuplicateHandling] =
    useState<DuplicateHandling>('warn');
  const [calendarName, setCalendarName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const settingsSectionRef = useRef<HTMLDivElement>(null);
  const prevFileCountRef = useRef<number>(0);
  const [isDraggingMore, setIsDraggingMore] = useState(false);

  // Auto-scroll to settings section only when transitioning from 0-1 files to 2+ files
  useEffect(() => {
    const prevCount = prevFileCountRef.current;
    const currentCount = fileContents.length;

    if (
      prevCount < 2 &&
      currentCount >= 2 &&
      settingsSectionRef.current &&
      settingsSectionRef.current.scrollIntoView
    ) {
      settingsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    prevFileCountRef.current = currentCount;
  }, [fileContents]);

  const handleFilesChange = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setMergeResult(null);
    setShowPreview(false);
    setSearchQuery('');

    // Read all files
    const readPromises = selectedFiles.map(
      (file, index) =>
        new Promise<{
          name: string;
          content: string;
          eventCount: number;
          events: ICalEvent[];
          sourceIndex: number;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const parsed = parseICalContent(content);
              const events = extractEvents(parsed.vevents);
              resolve({
                name: file.name,
                content,
                eventCount: parsed.totalEvents,
                events,
                sourceIndex: index,
              });
            } catch (error) {
              reject(new Error(`${file.name}: ${(error as Error).message}`));
            }
          };
          reader.onerror = () =>
            reject(new Error(`${file.name}: ファイルの読み込みに失敗しました`));
          reader.readAsText(file);
        }),
    );

    Promise.all(readPromises)
      .then((results) => {
        setFileContents(
          results.map((r) => ({
            name: r.name,
            content: r.content,
            eventCount: r.eventCount,
          })),
        );

        // Combine all events with source info and detect duplicates
        // First pass: collect all events and track UIDs
        const uidMap = new Map<
          string,
          { sourceIndex: number; eventIndex: number }
        >();
        const eventsWithSource: EventWithSource[] = [];

        results.forEach((result) => {
          result.events.forEach((event) => {
            const uid = event.uid;
            let isDuplicate = false;
            let duplicateOf: number | undefined;

            if (uid) {
              const existing = uidMap.get(uid);
              if (existing) {
                isDuplicate = true;
                duplicateOf = existing.sourceIndex;
                // Mark the original event as having duplicates
                eventsWithSource[existing.eventIndex].isOriginal = true;
              } else {
                uidMap.set(uid, {
                  sourceIndex: result.sourceIndex,
                  eventIndex: eventsWithSource.length,
                });
              }
            }

            eventsWithSource.push({
              ...event,
              sourceIndex: result.sourceIndex,
              sourceName: result.name,
              isDuplicate,
              isOriginal: false, // Will be set to true later if duplicates are found
              duplicateOf,
            });
          });
        });

        // Sort by date
        const sorted = sortEventsByDate(eventsWithSource) as EventWithSource[];
        setAllEvents(sorted);
      })
      .catch((error) => {
        alert('iCalファイルの読み込みに失敗しました: ' + error.message);
        setFiles([]);
        setFileContents([]);
        setAllEvents([]);
      });
  }, []);

  const addMoreFiles = useCallback(
    (newFiles: File[]) => {
      const allFiles = [...files, ...newFiles];
      handleFilesChange(allFiles);
    },
    [files, handleFilesChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setFiles([]);
        setFileContents([]);
        setMergeResult(null);
      } else {
        handleFilesChange(newFiles);
      }
    },
    [files, handleFilesChange],
  );

  const mergeAndDownload = async () => {
    if (fileContents.length === 0) return;

    setIsProcessing(true);

    try {
      const contents = fileContents.map((f) => f.content);
      const result = await merge(contents, {
        duplicates: duplicateHandling,
        calendarName: calendarName || undefined,
      });

      setMergeResult(result);

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = calendarName
        ? `${calendarName.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`
        : `merged_${timestamp}.ics`;

      // Download the merged file
      const blob = new Blob([result.content], {
        type: 'text/calendar;charset=utf-8',
      });
      saveAs(blob, filename);
    } catch (error) {
      alert('マージ処理に失敗しました: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalEvents = fileContents.reduce((sum, f) => sum + f.eventCount, 0);

  // Filtered events for preview
  const filteredEvents = useMemo(() => {
    return filterEvents(allEvents, searchQuery) as EventWithSource[];
  }, [allEvents, searchQuery]);

  // Count duplicates (events involved in duplication - both originals and duplicates)
  const duplicateCount = useMemo(() => {
    return allEvents.filter((e) => e.isDuplicate || e.isOriginal).length;
  }, [allEvents]);

  // Check if event is involved in duplication
  const hasDuplication = (event: EventWithSource) =>
    event.isDuplicate || event.isOriginal;

  // Format date helper
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // Get color for source file
  const getSourceColor = (index: number) => {
    return SOURCE_COLORS[index % SOURCE_COLORS.length];
  };

  // Get short filename for badge
  const getShortFilename = (name: string) => {
    const maxLength = 15;
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + '...';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <PageHeader
          title="Merger"
          description="複数のiCalファイルを1つに統合"
        />

        {files.length === 0 ? (
          <FileDropZone
            multiple
            onFilesChange={handleFilesChange}
            selectedFiles={files}
            dropLabel="iCalファイルをドロップ（複数可）"
            buttonLabel="ファイルを選択"
          />
        ) : (
          <>
            {/* Selected Files List */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  📁 選択されたファイル
                </h2>
                <label className="inline-block">
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-200 transition-colors font-medium text-sm">
                    + ファイルを追加
                  </span>
                  <input
                    type="file"
                    accept=".ics"
                    multiple
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      if (newFiles.length > 0) {
                        addMoreFiles(newFiles);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-2">
                {fileContents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.eventCount.toLocaleString()} イベント
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Drop zone for adding more files */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingMore(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingMore(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingMore(false);
                  const droppedFiles = Array.from(e.dataTransfer.files).filter(
                    (file) => file.name.endsWith('.ics'),
                  );
                  if (droppedFiles.length > 0) {
                    addMoreFiles(droppedFiles);
                  }
                }}
                className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                  isDraggingMore
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm text-gray-500">
                  ここにファイルをドロップして追加
                </p>
              </div>
            </div>

            {/* Settings Section */}
            <div
              ref={settingsSectionRef}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-xs mb-1">ファイル数</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {fileContents.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-xs mb-1">総イベント数</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totalEvents.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-4 text-center ${
                    duplicateCount > 0
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50'
                      : 'bg-gradient-to-br from-green-50 to-emerald-50'
                  }`}
                >
                  <p className="text-gray-600 text-xs mb-1">重複イベント</p>
                  <p
                    className={`text-3xl font-bold ${
                      duplicateCount > 0 ? 'text-amber-600' : 'text-green-600'
                    }`}
                  >
                    {duplicateCount}
                  </p>
                </div>
              </div>

              {/* Duplicate Handling */}
              <div className="mb-6">
                <label
                  htmlFor="duplicate-handling"
                  className="block text-lg font-semibold text-gray-700 mb-2"
                >
                  重複イベントの処理
                </label>
                <select
                  id="duplicate-handling"
                  value={duplicateHandling}
                  onChange={(e) =>
                    setDuplicateHandling(e.target.value as DuplicateHandling)
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="warn">全て保持</option>
                  <option value="remove">重複を削除（最初のものを保持）</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  重複はUID（イベントの一意識別子）で判定されます
                </p>
              </div>

              {/* Calendar Name */}
              <div className="mb-6">
                <label
                  htmlFor="calendar-name"
                  className="block text-lg font-semibold text-gray-700 mb-2"
                >
                  カレンダー名（任意）
                </label>
                <input
                  id="calendar-name"
                  type="text"
                  value={calendarName}
                  onChange={(e) => setCalendarName(e.target.value)}
                  placeholder="未指定の場合は最初のファイルの名前を使用"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Merge Button */}
              <button
                onClick={mergeAndDownload}
                disabled={isProcessing || fileContents.length < 2}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  isProcessing || fileContents.length < 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isProcessing && (
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
                )}
                {!isProcessing &&
                  fileContents.length < 2 &&
                  '2つ以上のファイルを選択してください'}
                {!isProcessing &&
                  fileContents.length >= 2 &&
                  `🔀 ${fileContents.length}個のファイルをマージしてダウンロード`}
              </button>

              {/* Merge Result */}
              {mergeResult && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ マージ完了
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      合計イベント数: {mergeResult.totalEvents.toLocaleString()}
                    </li>
                    <li>マージしたファイル数: {mergeResult.sourceCount}</li>
                    {mergeResult.metadata.duplicatesFound > 0 && (
                      <li>
                        重複検出: {mergeResult.metadata.duplicatesFound}件
                        {mergeResult.metadata.duplicatesRemoved > 0 &&
                          ` (${mergeResult.metadata.duplicatesRemoved}件削除)`}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Event Preview Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between text-left mb-4"
                >
                  <h2 className="text-2xl font-bold text-gray-800">
                    📅 イベントプレビュー
                  </h2>
                  <svg
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showPreview ? 'rotate-180' : ''
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

                {showPreview && (
                  <div className="space-y-4">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {fileContents.map((file, index) => {
                        const color = getSourceColor(index);
                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs font-medium rounded ${color.bg} ${color.text}`}
                          >
                            {getShortFilename(file.name)}
                          </span>
                        );
                      })}
                      {duplicateCount > 0 && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 border border-red-300">
                          ⚠ 重複
                        </span>
                      )}
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="🔍 イベントを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {filteredEvents.length} / {allEvents.length} イベント
                        {duplicateCount > 0 &&
                          ` (重複関連: ${filteredEvents.filter((e) => hasDuplication(e)).length}件)`}
                      </p>
                    </div>

                    {/* Event List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {filteredEvents.map((event, index) => {
                        const color = getSourceColor(event.sourceIndex);
                        return (
                          <div
                            key={`${event.sourceIndex}-${event.id}-${index}`}
                            className={`border rounded-lg p-4 transition-all ${
                              hasDuplication(event)
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-gray-800 flex-1">
                                {event.summary}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {hasDuplication(event) &&
                                  duplicateHandling === 'remove' &&
                                  event.isOriginal && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                                      保持
                                    </span>
                                  )}
                                {hasDuplication(event) &&
                                  duplicateHandling === 'remove' &&
                                  !event.isOriginal && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                                      削除
                                    </span>
                                  )}
                                {hasDuplication(event) && (
                                  <span
                                    className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                                    title={
                                      event.isDuplicate
                                        ? `${fileContents[event.duplicateOf ?? 0]?.name ?? ''} と重複`
                                        : '重複あり'
                                    }
                                  >
                                    ⚠ 重複
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded ${color.bg} ${color.text}`}
                                  title={event.sourceName}
                                >
                                  {getShortFilename(event.sourceName)}
                                </span>
                              </div>
                            </div>
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
                        );
                      })}
                      {filteredEvents.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          イベントが見つかりません
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          <p className="mb-2">
            💡 重複イベントはUID（イベントの一意識別子）で判定されます
          </p>
          <p>マージされたファイルは.ics形式でダウンロードされます</p>
        </div>
      </div>
    </div>
  );
}
