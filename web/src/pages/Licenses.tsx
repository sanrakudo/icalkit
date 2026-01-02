import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface License {
  name: string;
  version: string;
  license: string;
  repository: string | { type: string; url: string; directory?: string };
  licenseText: string;
}

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/licenses.json')
      .then((res) => res.json())
      .then((data) => {
        setLicenses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load licenses:', error);
        setLoading(false);
      });
  }, []);

  const filteredLicenses = useMemo(() => {
    if (!searchQuery.trim()) return licenses;

    const query = searchQuery.toLowerCase();
    return licenses.filter(
      (lib) =>
        lib.name.toLowerCase().includes(query) ||
        lib.license.toLowerCase().includes(query),
    );
  }, [licenses, searchQuery]);

  const toggleLicense = (name: string) => {
    setExpandedLicense(expandedLicense === name ? null : name);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <img
              src="/icalkit-icon.svg"
              alt="iCalKit Logo"
              className="w-12 h-12"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              iCalKit
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-4">
            オープンソースライセンス
          </h2>
          <p className="text-gray-600">
            このアプリケーションで使用しているオープンソースライブラリのライセンス情報
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="ライブラリ名やライセンスで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* License List */}
        {!loading && (
          <>
            <div className="mb-6 text-gray-600 text-sm">
              {filteredLicenses.length} 個のライブラリ
            </div>

            <div className="space-y-4">
              {filteredLicenses.map((lib) => (
                <div
                  key={lib.name}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleLicense(lib.name)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <h3 className="font-bold text-lg text-gray-800">
                          {lib.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          v{lib.version} • {lib.license}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        expandedLicense === lib.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>

                  {expandedLicense === lib.name && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      {lib.repository && (
                        <div className="mt-4 mb-4">
                          <a
                            href={
                              typeof lib.repository === 'string'
                                ? lib.repository
                                : lib.repository.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 text-sm"
                          >
                            🔗 リポジトリ
                          </a>
                        </div>
                      )}
                      <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                        {lib.licenseText ||
                          'ライセンステキストが利用できません'}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
