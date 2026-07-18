import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reservationService, normalizeReservationsPayload } from '../services/reservation.service';

const initialState = {
  reservations: [],
  pagination: null,
  selectedReservation: null,
  loading: false,
  error: null,
};

export const fetchReservations = createAsyncThunk(
  'reservations/fetchAll',
  async (params = {}) => {
    const response = await reservationService.getAll(params);
    return normalizeReservationsPayload(response.data);
  }
);

export const createReservation = createAsyncThunk(
  'reservations/create',
  async (data) => {
    const response = await reservationService.create(data);
    return response.data;
  }
);

export const updateReservation = createAsyncThunk(
  'reservations/update',
  async ({ id, data }) => {
    const response = await reservationService.update(id, data);
    return response.data;
  }
);

export const changeReservationStatus = createAsyncThunk(
  'reservations/changeStatus',
  async ({ id, status }) => {
    const response = await reservationService.changeStatus(id, status);
    return response.data;
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (id) => {
    await reservationService.delete(id);
    return id;
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setSelectedReservation: (state, action) => {
      state.selectedReservation = action.payload;
    },
    clearSelectedReservation: (state) => {
      state.selectedReservation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload.reservations;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Bronlarni yuklashda xatolik';
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.reservations.unshift(action.payload);
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.reservations[index] = action.payload;
      })
      .addCase(changeReservationStatus.fulfilled, (state, action) => {
        const index = state.reservations.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.reservations[index] = { ...state.reservations[index], ...action.payload };
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.reservations = state.reservations.filter((r) => r.id !== action.payload);
      });
  },
});

export const { setSelectedReservation, clearSelectedReservation } = reservationSlice.actions;
export default reservationSlice.reducer;
