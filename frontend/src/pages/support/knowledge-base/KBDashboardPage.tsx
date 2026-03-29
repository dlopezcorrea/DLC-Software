import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Folder } from 'lucide-react';
import { apiClient } from '@/api/client';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';

interface KBCategory {
  id: string;
  name: string;
  description?: string;
  articleCount: number;
  slug?: string;
}

interface KBArticle {
  id: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  excerpt?: string;
  slug?: string;
}

export default function KBDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data: categories, isLoading: categoriesLoading } = useQuery<KBCategory[]>({
    queryKey: ['kb-categories'],
    queryFn: () => apiClient.get('/support/kb/categories').then((r) => r.data.data),
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<KBArticle[]>({
    queryKey: ['kb-search', debouncedSearch],
    queryFn: () =>
      apiClient
        .get('/support/kb/search', { params: { q: debouncedSearch } })
        .then((r) => r.data.data),
    enabled: debouncedSearch.trim().length > 0,
  });

  const cats = categories ?? [];
  const results = searchResults ?? [];

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Browse articles and help documentation"
      />

      {/* Search Box */}
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Search Results */}
      {debouncedSearch.trim().length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            Search Results{results.length > 0 ? ` (${results.length})` : ''}
          </h2>
          {searchLoading ? (
            <LoadingSpinner />
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">
                No articles found for &quot;{debouncedSearch}&quot;
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {results.map((article) => (
                <Link
                  key={article.id}
                  to={`/support/kb/articles/${article.id}`}
                  className="block px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                    {article.title}
                  </p>
                  {article.categoryName && (
                    <p className="text-xs text-slate-400 mt-0.5">{article.categoryName}</p>
                  )}
                  {article.excerpt && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Grid */}
      {!debouncedSearch.trim() && (
        <>
          <h2 className="text-base font-semibold text-slate-700 mb-4">Categories</h2>
          {categoriesLoading ? (
            <LoadingSpinner />
          ) : cats.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No categories yet"
              description="Knowledge base categories will appear here once created."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/support/kb/categories/${cat.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {cat.articleCount} {cat.articleCount === 1 ? 'article' : 'articles'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
