import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/icalkit-icon.svg"
              alt="iCalKit Logo"
              className="w-16 h-16"
            />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              iCalKit
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            カレンダーファイル管理を簡単に。ブラウザ上で完結する安全なツール群
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <a
              href="#tools"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              使ってみる →
            </a>
            <a
              href="#features"
              className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              特徴を見る
            </a>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <section id="tools" className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          できること
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          iCalendar形式（.ics）のファイルを、4つのツールで手軽に操作
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Splitter */}
          <Link
            to="/splitter"
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-8 border-2 border-transparent hover:border-indigo-200"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">📂</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  Splitter
                </h3>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mt-2">
                  利用可能
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              大きなiCalファイルを指定した件数ごとに分割。Googleカレンダーなどのインポート制限を回避できます。
            </p>
            <ul className="text-sm text-gray-500 space-y-2 mb-4">
              <li>✓ 柔軟な分割サイズ設定(50〜1000件)</li>
              <li>✓ ZIPファイルで一括ダウンロード</li>
              <li>✓ イベント一覧のプレビュー・検索</li>
              <li>✓ メタデータを完全保持</li>
            </ul>
            <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              今すぐ使う →
            </div>
          </Link>

          {/* Viewer */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 opacity-75">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">👁️</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Viewer</h3>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mt-2">
                  近日公開
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              iCalファイルの内容を美しく表示。検索、フィルタリング、統計情報の確認が可能です。
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>✓ カレンダー・リスト表示切替</li>
              <li>✓ 高度な検索・フィルター機能</li>
              <li>✓ 統計情報の可視化</li>
              <li>✓ イベント詳細の表示</li>
            </ul>
          </div>

          {/* Merger */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 opacity-75">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">🔀</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Merger</h3>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mt-2">
                  近日公開
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              複数のiCalファイルを1つに統合。異なるソースからのカレンダーをまとめて管理できます。
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>✓ 複数ファイルの一括マージ</li>
              <li>✓ 重複イベントの自動検出</li>
              <li>✓ カレンダー名の保持・変更</li>
              <li>✓ マージプレビュー</li>
            </ul>
          </div>

          {/* Cleaner */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 opacity-75">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">🧹</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Cleaner</h3>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mt-2">
                  近日公開
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              重複イベントの削除や不要な情報のクリーンアップで、カレンダーを整理整頓。
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>✓ 重複イベントの検出・削除</li>
              <li>✓ 古いイベントの一括削除</li>
              <li>✓ 不要なフィールドの削除</li>
              <li>✓ クリーンアッププレビュー</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          特徴
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-bold text-lg mb-2">完全プライバシー保護</h3>
            <p className="text-gray-600 text-sm">
              カレンダーファイルはブラウザ内で処理。サーバーにアップロードされません
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2">高速処理</h3>
            <p className="text-gray-600 text-sm">
              数千件のイベントも瞬時に処理。待ち時間なしでスムーズに
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-lg mb-2">シンプルUI</h3>
            <p className="text-gray-600 text-sm">
              直感的で使いやすいインターフェース。誰でも簡単に操作できます
            </p>
          </div>
        </div>
      </section>

      {/* CLI Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">💻 CLI版も利用可能</h2>
          <p className="text-gray-300 mb-6">
            自動化やスクリプト処理に最適なコマンドラインツール
          </p>
          <pre className="bg-black bg-opacity-50 rounded-lg p-4 text-sm overflow-x-auto">
            <code className="text-green-400">
              {`# インストール
npm install -g icalkit

# ファイルを分割
icalkit split calendar.ics --chunk-size 1000

# ファイルを表示
icalkit view calendar.ics

# ファイルをマージ
icalkit merge file1.ics file2.ics -o merged.ics`}
            </code>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600">
        <div className="mb-4">
          <a
            href="https://github.com/sanrakudo/icalkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            GitHub
          </a>
          <span className="mx-3">•</span>
          <a
            href="https://github.com/sanrakudo/icalkit/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            バグ報告
          </a>
          <span className="mx-3">•</span>
          <Link
            to="/licenses"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ライセンス情報
          </Link>
        </div>
      </footer>
    </div>
  );
}
