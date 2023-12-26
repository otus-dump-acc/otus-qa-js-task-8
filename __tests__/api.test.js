const config = require('./framework/config')
const api = require('../src/api')
const userService = require('./framework/services/userService')

let sessionToken = null
let userData = null

beforeAll(async () => {
    const credentials = { userName: config.credentials.username, password: config.credentials.password }
    try {
        userData = await userService.createUser(credentials)
        sessionToken = await userService.authorize(credentials)
    } catch (e) {
        console.error(e)
    }
})
afterAll(async () => {
    try {
        await userService.removeUser({ token: sessionToken, userId: userData.userID })
    } catch (e) {
        console.error(e)
    }
})

describe('Book service', () => {
    test('Create: success', async () => {
        const response = await api.book.create({
            token: sessionToken,
            body: {
                userId: userData.userID,
                collectionOfIsbns: [
                  {
                    isbn: config.book.isbn
                  }
                ]
              }
        })
        expect(response.status).toEqual(201)
        const parsed = await response.json()
        const isbn = parsed.books[0].isbn
        expect(isbn).toEqual(config.book.isbn)
    })
    test('Create: unautorized', async() => {
        const response = await api.book.create({
            body: {
                userId: userData.userID,
                collectionOfIsbns: [
                  {
                    isbn: config.book.isbn
                  }
                ]
              }
        })
        expect(response.status).toEqual(401)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1200)
        expect(parsed.message).toEqual('User not authorized!')
    })
    test('Create: alredy created', async () => {
        const response = await api.book.create({
            token: sessionToken,
            body: {
                userId: userData.userID,
                collectionOfIsbns: [
                  {
                    isbn: config.book.isbn
                  }
                ]
              }
        })
        expect(response.status).toEqual(400)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1210)
        expect(parsed.message).toEqual("ISBN already present in the User's Collection!")
    })
    test('Get: success', async() => {
        const response = await api.book.getByISBN({
            token: sessionToken,
            isbn: config.book.isbn,
        })
        expect(response.status).toEqual(200)
        const parsed = await response.json()
        expect(parsed.isbn).toEqual(config.book.isbn)
    })
    test('Get: not found', async () => {
        const response = await api.book.getByISBN({
            token: sessionToken,
            isbn: config.book.isbnInvalid,
        })
        expect(response.status).toEqual(400)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1205)
        expect(parsed.message).toEqual('ISBN supplied is not available in Books Collection!')
    })
    test('Update: isbn already in users collection', async () => {
        const response = await api.book.update({
            token: sessionToken,
            isbn: config.book.isbn,
            userId: userData.userID,
            newIsbn: config.book.isbn,
        })
        expect(response.status).toEqual(400)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1206)
        expect(parsed.message).toEqual("ISBN supplied is not available in User's Collection!")
    })
    test('Update: success', async () => {
        const response = await api.book.update({
            token: sessionToken,
            isbn: config.book.isbn,
            userId: userData.userID,
            newIsbn: config.book.isbnForUpdate,
        })
        expect(response.status).toEqual(200)
        const parsed = await response.json()
        expect(parsed.userId).toEqual(userData.userID)
        expect(parsed.books[0].isbn).toEqual(config.book.isbnForUpdate)
    })
    test('Update: unauthorized', async () => {
        const response = await api.book.update({
            isbn: config.book.isbn,
            userId: userData.userID,
            newIsbn: config.book.isbnForUpdate,
        })
        expect(response.status).toEqual(401)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1200)
        expect(parsed.message).toEqual('User not authorized!')
    })
    test('Update: isbn not in users collection', async () => {
        const response = await api.book.update({
            token: sessionToken,
            isbn: config.book.isbn,
            userId: userData.userID,
            newIsbn: config.book.isbn,
        })
        expect(response.status).toEqual(400)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1206)
        expect(parsed.message).toEqual("ISBN supplied is not available in User's Collection!")
    })
    test('Remove: success', async () => {
        const response = await api.book.delete({
            token: sessionToken,
            userId: userData.userID,
            isbn: config.book.isbnForUpdate,
        })
        expect(response.status).toEqual(204)
    })
    test('Remove: not found', async () => {
        const response = await api.book.delete({
            token: sessionToken,
            userId: userData.userID,
            isbn: config.book.isbnForUpdate,
        })
        expect(response.status).toEqual(400)
        const parsed = await response.json()
        expect(Number(parsed.code)).toEqual(1206)
        expect(parsed.message).toEqual("ISBN supplied is not available in User's Collection!")
    })
})