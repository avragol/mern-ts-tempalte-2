import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../services/api';
import type { IUser } from '../../types';

interface UserState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data as IUser;
    } catch {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return rejectWithValue('Session expired');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, user } = data.data as { token: string; user: IUser };
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return user;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError?.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (
    payload: { firstName: string; lastName: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      const { token, user } = data.data as { token: string; user: IUser };
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return user;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError?.response?.data?.message || 'Registration failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.loading = false; state.user = null; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.error = null; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.error = null; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { logout, setUser, clearError } = userSlice.actions;
export default userSlice.reducer;
