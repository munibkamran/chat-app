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
  },
});

export const { changeUser } = chatSlice.actions
export default chatSlice.reducer
