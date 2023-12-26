require('dotenv').config()

const BASE_URL = process.env.BASE_URL
const API_USER_PATH = process.env.API_USER_PATH
const API_BOOK_PATH = process.env.API_BOOK_PATH

/** User service API endpoints */
const user = {
    create: async ({ userName, password }) => await buildEndpoint({
        body: { userName, password },
        url: `${BASE_URL}/${API_USER_PATH}/User`,
        method: 'POST',
    }),
    login: async ({ userName, password }) => await buildEndpoint({
        body: { userName, password },
        url: `${BASE_URL}/${API_USER_PATH}/GenerateToken`,
        method: 'POST',
    }),
    remove: async ({ token, userId }) => await buildEndpoint({
        url: `${BASE_URL}/${API_USER_PATH}/GenerateToken/${userId}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }),
}

/** Book service API endpoints */
const book = {
    /** Create new book entity. */
    create: async ({ token, body }) => {
        return await buildEndpoint({
            body,
            url: `${BASE_URL}/${API_BOOK_PATH}/Books`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    },
    /** Update data of created book entity. */
    update: async ({ token, isbn, userId, newIsbn }) => await buildEndpoint({
        url: `${BASE_URL}/${API_BOOK_PATH}/Books/${isbn}`,
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: {
            userId,
            isbn: newIsbn,
        }
    }),
    /** Get data of created book entity. */
    getByISBN: async ({ token, isbn }) => await buildEndpoint({
        url: `${BASE_URL}/${API_BOOK_PATH}/Book/?ISBN=${isbn}`,
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }),
    /** Permanently remove created book entity. */
    delete: async ({ token, userId, isbn }) => await buildEndpoint({
        url: `${BASE_URL}/${API_BOOK_PATH}/Book`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: {
            isbn,
            userId,
          }
    }),
}

/** Builds initial endpoint for API request with predefined parameters. */
function buildEndpoint({ url, headers, body, method = "GET" }) {
    return fetch(url, {
        headers: new Headers(Object.assign({ 'Content-Type': 'application/json', 'Accept': '*/*' }, headers)),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        method,
    })
}

module.exports = {
    user,
    book,
}
