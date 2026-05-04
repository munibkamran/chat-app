import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatId: "null",
    user: null,
  },

  reducers: {
    changeUser: (state, action) => {
      const { user, currentUserUid } = action.payload;
      state.user = user;

      state.chatId =
        currentUserUid > user.uid
          ? currentUserUid + user.uid
          : user.uid + currentUserUid;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

export const { changeUser, setUser } = chatSlice.actions
export default chatSlice.reducer
