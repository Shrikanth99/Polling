export const BASE_URL = `http://localhost:8000`

export const API_PATHS = {
    AUTH : {
        LOGIN : `/api/v1/auth/login`,
        REGISTER : `/api/v1/auth/register`,
        GET_USER_INFO : `/api/v1/auth/account`,
        UPDATE_PROFILE : '/api/v1/auth/update',
    },
    IMAGE : {
        UPLOAD_IMAGE : '/api/v1/auth/upload-image'
    },
    POLLS : {
        CREATE : `/api/v1/poll/create`,
        GET_ALL_POLLS : `/api/v1/poll/getAllPolls`,
        GET_POLL_BY_ID : (pollId) => `/api/v1/poll/${pollId}`,
        VOTE_POLL : (pollId) => `/api/v1/poll/${pollId}/vote`,
        CLOSE_POLL : (pollId) => `/api/v1/poll/${pollId}/close`,
        BOOKMARK_POLL : (pollId) => `/api/v1/poll/${pollId}/bookmark`,
        GET_BOOKMARKED_POLL : `/api/v1/poll/user/bookmarked`,
        VOTED_POLLS : `/api/v1/poll/votedPolls`,
        DELETE : (pollId) => `/api/v1/poll/${pollId}/delete`,

    }
};