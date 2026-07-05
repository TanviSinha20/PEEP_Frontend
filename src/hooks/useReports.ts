'use client';

import { useState, useCallback } from 'react';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { Report, ReportListResponse } from '@/types/report';
import { usePolling } from './usePolling';
import { DASHBOARD_POLL_INTERVAL, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import toast from 'react-hot-toast';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchReports = useCallback(async (pageNum = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await apiClient.get<ReportListResponse>(
        `/reports?page=${pageNum}&limit=${DEFAULT_PAGE_SIZE}`
      );
      if (pageNum === 1) {
        setReports(data.reports);
      } else {
        setReports((prev) => [...prev, ...data.reports]);
      }
      setTotal(data.total);
      setPage(pageNum);
    } catch (err) {
      if (!silent) toast.error(getApiErrorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Report deleted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  }, []);

  const prependReport = useCallback((report: Report) => {
    setReports((prev) => [report, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  // Auto-poll while any report is in "processing" state
  const hasProcessing = reports.some((r) => r.status === 'processing');
  usePolling(() => fetchReports(1, true), DASHBOARD_POLL_INTERVAL, hasProcessing);

  const hasMore = reports.length < total;

  return {
    reports,
    total,
    loading,
    hasMore,
    fetchReports,
    deleteReport,
    prependReport,
    loadMore: () => fetchReports(page + 1),
  };
}
