import { useCallback, useState } from 'react';

interface FileDropZoneProps {
  /** Whether to accept multiple files */
  multiple?: boolean;
  /** Accepted file extensions (e.g., ".ics") */
  accept?: string;
  /** Called when file(s) are selected */
  onFilesChange: (files: File[]) => void;
  /** Currently selected files (for display) */
  selectedFiles?: File[];
  /** Custom label for the drop area */
  dropLabel?: string;
  /** Custom button label */
  buttonLabel?: string;
}

export default function FileDropZone({
  multiple = false,
  accept = '.ics',
  onFilesChange,
  selectedFiles = [],
  dropLabel = 'iCalファイルをドロップ',
  buttonLabel = 'ファイルを選択',
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

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

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.endsWith('.ics'),
      );

      if (droppedFiles.length === 0) {
        alert('.ics ファイルを選択してください');
        return;
      }

      if (!multiple && droppedFiles.length > 1) {
        // In single mode, only take the first file
        onFilesChange([droppedFiles[0]]);
      } else {
        onFilesChange(droppedFiles);
      }
    },
    [multiple, onFilesChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const filteredFiles = Array.from(files).filter((file) =>
        file.name.endsWith('.ics'),
      );

      if (filteredFiles.length === 0) {
        alert('.ics ファイルを選択してください');
        return;
      }

      onFilesChange(filteredFiles);

      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [onFilesChange],
  );

  return (
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
        <p className="text-xl font-semibold text-gray-700 mb-2">{dropLabel}</p>
        <p className="text-gray-500 mb-4">または</p>
        <label className="inline-block">
          <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg font-medium">
            {buttonLabel}
          </span>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
        {selectedFiles.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            {selectedFiles.length === 1 ? (
              <p className="text-indigo-800 font-medium">
                📄 {selectedFiles[0].name}
              </p>
            ) : (
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <p key={index} className="text-indigo-800 font-medium">
                    📄 {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
