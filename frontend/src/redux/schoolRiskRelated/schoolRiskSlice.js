import { createSlice } from '@reduxjs/toolkit';

const schoolRiskSlice = createSlice({
  name: 'schoolRisk',
  initialState: {
    schoolRiskLevels: {}
  },
  reducers: {
    setSchoolRiskLevel: (state, action) => {
      const { schoolId, riskLevel } = action.payload;
      state.schoolRiskLevels[schoolId] = riskLevel;
    },
    clearSchoolRiskLevels: (state) => {
      state.schoolRiskLevels = {};
    }
  }
});

export const { setSchoolRiskLevel, clearSchoolRiskLevels } = schoolRiskSlice.actions;
export const schoolRiskReducer = schoolRiskSlice.reducer;
