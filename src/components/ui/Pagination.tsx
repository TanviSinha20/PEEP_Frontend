import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
}

export function Pagination({ page, hasMore, onLoadMore, loading = false }: PaginationProps) {
  if (!hasMore) return null;
  
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="outline" onClick={onLoadMore} disabled={loading}>
        {loading ? 'Loading...' : 'Load More'}
      </Button>
    </div>
  );
}
