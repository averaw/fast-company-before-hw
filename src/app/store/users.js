import { createAction, createSlice } from "@reduxjs/toolkit";
import authService from "../services/autn.service";
import localStorageService from "../services/localStorage.service";
import history from "../utils/history";
import userService from "../services/user.service";
import { generateAuthError } from "../utils/generateAuthError";

const initialState = localStorageService.getAccessToken()
    ? {
          entities: null,
          isLoading: true,
          error: null,
          auth: { userId: localStorageService.getUserId() },
          isLoggadIn: true,
          dataLoaded: false
      }
    : {
          entities: null,
          isLoading: false,
          error: null,
          auth: null,
          isLoggadIn: false,
          dataLoaded: false
      };

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        usersRequested: (state) => {
            state.isLoading = true;
        },
        usersReceived: (state, action) => {
            state.entities = action.payload;
            state.isLoading = false;
            state.dataLoaded = true;
        },
        usersRequestFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        authRequestSucess: (state, action) => {
            state.auth = action.payload;
            state.isLoggadIn = true;
        },
        authRequestFailed: (state, action) => {
            state.error = action.payload;
        },
        userCreated: (state, action) => {
            if (!Array.isArray(state.entities)) {
                state.entities = [];
            }
            state.entities.push(action.payload);
        },
        userLoggedOut: (state) => {
            state.entities = null;
            state.isLoggadIn = false;
            state.auth = null;
            state.dataLoaded = false;
        },
        userUpdateSuccessed: (state, action) => {
            state.entities[
                state.entities.findIndex((u) => u.id === action._id)
            ] = action.payload;
        },
        authRequested: (state) => {
            state.error = null;
        }
    }
});
const { reducer: usersReducer, actions } = usersSlice;
const {
    usersRequested,
    usersReceived,
    usersRequestFailed,
    authRequestSucess,
    authRequestFailed,
    userCreated,
    userLoggedOut,
    userUpdateSuccessed
} = actions;

const authRequested = createAction("users/authRequested ");
const userCreateRequested = createAction("users/userCreateRequested ");
const createUserFaild = createAction("users/createUserFaild ");
const userUpdateFaild = createAction("users/userUpdateFaild");
const userUpdateRequested = createAction("users/ userUpdateSuccessed");
// отработка ошибки для createUser 86

export const login =
    ({ payload, redirect }) =>
    async (dispatch) => {
        const { email, password } = payload;
        dispatch(authRequested());
        try {
            const data = await authService.login({ email, password });
            dispatch(authRequestSucess({ userId: data.localId }));
            localStorageService.setTokens(data);
            history.push(redirect);
        } catch (error) {
            const { code, message } = error.response.data.error;
            if (code === 400) {
                const errorMessage = generateAuthError(message);
                dispatch(authRequestFailed(errorMessage));
            } else {
                dispatch(authRequestFailed(error.message));
            }
        }
    };
export const signUp =
    ({ email, password, ...rest }) =>
    async (dispatch) => {
        dispatch(authRequested());
        try {
            const data = await authService.register({ email, password });
            localStorageService.setTokens(data);
            dispatch(authRequestSucess({ userId: data.localId }));
            dispatch(
                createUser({
                    _id: data.localId,
                    email,
                    rate: randomInt(1, 5),
                    completedMeetings: randomInt(0, 200),
                    image: `https://avatars.dicebear.com/api/avataaars/${(
                        Math.random() + 1
                    )
                        .toString(36)
                        .substring(7)}.svg`,
                    ...rest
                })
            );
        } catch (error) {
            dispatch(authRequestFailed(error.massage));
        }
    };
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const logOut = () => (dispath) => {
    localStorageService.removeAuthData();
    dispath(userLoggedOut());
    history.push("/");
};

export const updateUserData = (payload) => async (dispath) => {
    dispath(userUpdateRequested());
    try {
        const { content } = await userService.update(payload);
        dispath(userUpdateSuccessed(content));
        history.push(`/users/${content._id}`);
    } catch (error) {
        dispath(userUpdateFaild());
    }
};
function createUser(payload) {
    return async function (dispatch) {
        dispatch(userCreateRequested());

        try {
            const { content } = await userService.create(payload);
            dispatch(userCreated(content));
            history.push("/users");
        } catch (error) {
            dispatch(createUserFaild(error.massage));
        }
    };
}

export const loadUsersList = () => async (dispatch, getState) => {
    dispatch(usersRequested());
    try {
        const { content } = await userService.get();
        dispatch(usersReceived(content));
    } catch (error) {
        dispatch(usersRequestFailed(error.message));
    }
};

export const getCurrentUserData = () => (state) => {
    return state.users.entities
        ? state.users.entities.find((u) => u._id === state.users.auth.userId)
        : null;
};
export const getUsersList = () => (state) => state.users.entities;
export const getUserByIds = (id) => (state) => {
    if (state.users.entities) {
        return state.users.entities.find((u) => u._id === id);
    }
};
export const getIsLoggadIn = () => (state) => state.users.isLoggadIn;
export const getDataStatus = () => (state) => state.users.dataLoaded;
export const getCurrentUserId = () => (state) => state.users.auth.userId;
export const getUsersLoadingStatus = () => (state) => state.users.isLoading;
export const getErrorAuth = () => (state) => state.users.error;

export default usersReducer;
