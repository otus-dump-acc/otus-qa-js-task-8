const api = require('../../../src/api')

module.exports = {
    createUser: async ({ userName, password }) =>  {
        const response = await api.user.create({ userName, password })
        if (response.status !== 201) {
            throw new Error('Creating user error.')
        }
        return await response.json()
    },
    authorize: async ({ userName, password }) => {
        const tokenResponse = await api.user.login({ userName, password })
        if (tokenResponse.status !== 200) {
            throw new Error('Authorization error.')
        }
        const parsedTokenObj = await tokenResponse.json()
        if (parsedTokenObj.status === 'Success') {
            return parsedTokenObj.token
        }
        throw new Error(parsedTokenObj)
    },
    removeUser: async ({token, userId}) => {
        const response = await api.user.remove({token, userId})
        if (response.status !== 200) {
            throw new Error('Removeing user error ' + response.status)
        }
    }
}