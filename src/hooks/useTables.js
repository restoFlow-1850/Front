// src/features/tables/hooks/useTables.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, updateTableStatus, updateTable, setSelectedTable } from '../store/tableStore';

export const useTables = () => {
  const dispatch = useDispatch();
  const { tables, selectedTable, loading, error } = useSelector(
    (state) => state.tables
  );

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const changeStatus = async (id, status) => {
    try {
      await dispatch(updateTableStatus({ id, status })).unwrap();
      return { success: true };
    } catch (err) {
      console.error('Stol holatini yangilashda xatolik:', err);
      return { success: false, error: err };
    }
  };

  const updateTableData = async (id, data) => {
    try {
      await dispatch(updateTable({ id, data })).unwrap();
      return { success: true };
    } catch (err) {
      console.error('Stol maʼlumotlarini yangilashda xatolik:', err);
      return { success: false, error: err };
    }
  };

  const selectTable = (table) => {
    dispatch(setSelectedTable(table));
  };

  return {
    tables,
    selectedTable,
    loading,
    error,
    changeStatus,
    updateTableData,
    selectTable,
    refetch: () => dispatch(fetchTables()),
  };
};