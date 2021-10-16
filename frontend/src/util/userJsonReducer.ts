import { createReducer } from "@reduxjs/toolkit";
import { createUserJson, UserJson } from "./UserJson";

export const initialUserJson = createUserJson("NONE");
// Minimal example:
// https://codesandbox.io/s/vibrant-jasper-bvhs2?file=/src/App.js
export const reducer = createReducer(initialUserJson, {
  SET: (state: UserJson, action) => {
    state = action.value;
    return action.value;
  },
  SET_TITLE: (state: UserJson, action) => {
    state.drops[action.key].dropTitle = action.value;
    state.drops[action.key].modified = Date.now();
  },
});
