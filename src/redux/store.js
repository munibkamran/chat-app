import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice"
import themeReducer from "./themeSlice"

export const store = configureStore({
    reducer:{
        chat:chatReducer,
        theme:themeReducer
    }
})
