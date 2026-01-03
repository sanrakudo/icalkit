import { Link } from 'react-router-dom';

interface PageHeaderProps {
  /** The title displayed after "iCalKit" */
  title: string;
  /** The description below the title */
  description: string;
  /** Optional privacy notice */
  privacyNote?: string;
}

export default function PageHeader({
  title,
  description,
  privacyNote = 'カレンダーファイルはブラウザ内で処理。サーバーにアップロードされません',
}: PageHeaderProps) {
  return (
    <div className="text-center mb-12">
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity"
      >
        <img src="/icalkit-icon.svg" alt="iCalKit Logo" className="w-12 h-12" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          iCalKit {title}
        </h1>
      </Link>
      <p className="text-gray-600 text-lg">{description}</p>
      {privacyNote && (
        <p className="text-gray-500 text-sm mt-2">🔒 {privacyNote}</p>
      )}
    </div>
  );
}
