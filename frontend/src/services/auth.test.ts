import { describe, it, expect, beforeEach } from 'vitest'
import {
    saveAuth,
    getToken,
    getUser,
    isAuthenticated,
    logout,
    clearAuth
} from './auth'

describe('Auth Service', () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada test (jsdom provee localStorage real)
        localStorage.clear()
    })

    describe('Token Management', () => {
        it('debería guardar y obtener un token usando saveAuth', () => {
            const user = { id: '123', name: 'Test User', email: 'test@example.com' }
            saveAuth('test-token-123', user)
            const token = getToken()
            expect(token).toBe('test-token-123')
        })

        it('debería retornar null si no hay token guardado', () => {
            const token = getToken()
            expect(token).toBeNull()
        })
    })

    describe('User Management', () => {
        it('debería guardar y obtener un usuario usando saveAuth', () => {
            const user = { id: '123', name: 'Test User', email: 'test@example.com' }
            saveAuth('test-token', user)
            const result = getUser()
            expect(result).toEqual(user)
        })

        it('debería retornar null si no hay usuario guardado', () => {
            const result = getUser()
            expect(result).toBeNull()
        })
    })

    describe('isAuthenticated', () => {
        it('debería retornar true si hay token guardado', () => {
            const user = { id: '1', name: 'Test', email: 'test@test.com' }
            saveAuth('valid-token', user)
            expect(isAuthenticated()).toBe(true)
        })

        it('debería retornar false si no hay token', () => {
            expect(isAuthenticated()).toBe(false)
        })
    })

    describe('logout / clearAuth', () => {
        it('debería remover token y usuario del localStorage con logout', () => {
            const user = { id: '1', name: 'Test', email: 'test@test.com' }
            saveAuth('test-token', user)

            // Verificar que están guardados
            expect(getToken()).toBe('test-token')
            expect(getUser()).not.toBeNull()

            // Logout
            logout()

            // Verificar que fueron removidos
            expect(getToken()).toBeNull()
            expect(getUser()).toBeNull()
        })

        it('debería remover token y usuario con clearAuth', () => {
            const user = { id: '1', name: 'Test', email: 'test@test.com' }
            saveAuth('test-token', user)

            clearAuth()

            expect(getToken()).toBeNull()
            expect(getUser()).toBeNull()
        })
    })
})
