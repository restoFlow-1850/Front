import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReservations,
  createReservation,
  updateReservation,
  changeReservationStatus,
  cancelReservation,
  setSelectedReservation,
} from '../store/reservationStore';

export const useReservations = (params = {}) => {
  const dispatch = useDispatch();
  const { reservations, pagination, selectedReservation, loading, error } = useSelector(
    (state) => state.reservations
  );

  useEffect(() => {
    dispatch(fetchReservations(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, params.page, params.limit]);

  const addReservation = async (data) => {
    try {
      await dispatch(createReservation(data)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const editReservation = async (id, data) => {
    try {
      await dispatch(updateReservation({ id, data })).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await dispatch(changeReservationStatus({ id, status })).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const removeReservation = async (id) => {
    try {
      await dispatch(cancelReservation(id)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const selectReservation = (reservation) => {
    dispatch(setSelectedReservation(reservation));
  };

  return {
    reservations,
    pagination,
    selectedReservation,
    loading,
    error,
    addReservation,
    editReservation,
    changeStatus,
    removeReservation,
    selectReservation,
    refetch: () => dispatch(fetchReservations(params)),
  };
};
