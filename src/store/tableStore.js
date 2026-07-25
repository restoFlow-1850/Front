// src/store/slices/tableSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tableService } from '../services/table.service';
import { TABLE_STATUS } from '../constants/tableStatus';

const sampleTables = [
  { id: 't1', number: 1, zone: 'A', status: TABLE_STATUS.AVAILABLE },
  { id: 't2', number: 2, zone: 'A', status: TABLE_STATUS.OCCUPIED },
  { id: 't3', number: 3, zone: 'A', status: TABLE_STATUS.RESERVED },
  { id: 't4', number: 4, zone: 'B', status: TABLE_STATUS.AVAILABLE },
  { id: 't5', number: 5, zone: 'B', status: TABLE_STATUS.CLEANING },
  { id: 't6', number: 6, zone: 'B', status: TABLE_STATUS.AVAILABLE },
  { id: 't7', number: 7, zone: 'C', status: TABLE_STATUS.OCCUPIED },
  { id: 't8', number: 8, zone: 'C', status: TABLE_STATUS.AVAILABLE },
];

const initialState = {
  tables: sampleTables,
  selectedTable: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTables = createAsyncThunk(
  'tables/fetchAll',
  async () => {
    try {
      const response = await tableService.getAll();
      return response.data;
    } catch (error) {
      console.error('Stollarni yuklashda xatolik:', error);
      return sampleTables;
    }
  },
  {
    // useTables() is called from multiple components at once (Waiter + TableMap2D);
    // without this guard each mount fires its own /api/tables request.
    condition: (_arg, { getState }) => {
      const { tables } = getState();
      return !tables.loading;
    },
  }
);

export const updateTableStatus = createAsyncThunk(
  'tables/updateStatus',
  async ({ id, status }) => {
    const response = await tableService.changeStatus(id, status);
    return response.data;
  }
);

export const updateTable = createAsyncThunk(
  'tables/update',
  async ({ id, data }) => {
    const response = await tableService.update(id, data);
    return response.data;
  }
);

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;
    },
    clearSelectedTable: (state) => {
      state.selectedTable = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Stollarni yuklashda xatolik';
      })
      // updateTableStatus
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        const index = state.tables.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
        if (state.selectedTable?.id === action.payload.id) {
          state.selectedTable = action.payload;
        }
      })
      // updateTable
      .addCase(updateTable.fulfilled, (state, action) => {
        const index = state.tables.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
        if (state.selectedTable?.id === action.payload.id) {
          state.selectedTable = action.payload;
        }
      });
  },
});

export const { setSelectedTable, clearSelectedTable } = tableSlice.actions;
export default tableSlice.reducer;