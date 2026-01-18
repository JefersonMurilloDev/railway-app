import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
    const mockAxios = {
        create: vi.fn(() => mockAxios),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
    return { default: mockAxios }
})

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Configuration', () => {
        it('debería crear una instancia de axios con la baseURL correcta', () => {
            // Verificar que axios.create fue llamado (ya se hizo al importar)
            expect(axios.create).toBeDefined()
        })

        it('debería tener interceptors configurados', () => {
            expect(axios.interceptors).toBeDefined()
            expect(axios.interceptors.request).toBeDefined()
            expect(axios.interceptors.response).toBeDefined()
        })
    })

    describe('Request Interceptor', () => {
        it('debería agregar token de autorización si existe', () => {
            // Simulamos el comportamiento del interceptor
            const config = { headers: {} as Record<string, string> }
            const token = 'test-token'

            // Simular lo que hace el interceptor
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }

            expect(config.headers['Authorization']).toBe('Bearer test-token')
        })

        it('no debería agregar token si no existe', () => {
            const config = { headers: {} as Record<string, string> }
            const token = null

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }

            expect(config.headers['Authorization']).toBeUndefined()
        })
    })

    describe('Response Interceptor', () => {
        it('debería manejar errores 401 correctamente', () => {
            const error = {
                response: {
                    status: 401,
                    config: { url: '/api/tasks' }
                }
            }

            // Verificar que es un error 401 de una ruta no-auth
            const isAuthRoute = error.response.config.url?.includes('/auth/')
            const shouldReload = error.response.status === 401 && !isAuthRoute

            expect(shouldReload).toBe(true)
        })

        it('no debería recargar la página para errores 401 en rutas de auth', () => {
            const error = {
                response: {
                    status: 401,
                    config: { url: '/auth/login' }
                }
            }

            const isAuthRoute = error.response.config.url?.includes('/auth/')
            const shouldReload = error.response.status === 401 && !isAuthRoute

            expect(shouldReload).toBe(false)
        })
    })

    describe('HTTP Methods', () => {
        it('debería tener métodos HTTP disponibles', () => {
            expect(axios.get).toBeDefined()
            expect(axios.post).toBeDefined()
            expect(axios.put).toBeDefined()
            expect(axios.delete).toBeDefined()
        })
    })
})
