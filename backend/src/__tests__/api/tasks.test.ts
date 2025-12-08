import express from 'express';
import request from 'supertest';
import taskRoutes from '../../routes/tasks.js';
import errorHandler from '../../middleware/errorHandler.js';

// Crear app de Express para tests
const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

describe('Task API Endpoints', () => {
    describe('POST /api/tasks', () => {
        it('debería crear una nueva tarea', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({
                    title: 'Nueva tarea',
                    description: 'Descripción de prueba',
                    priority: 'high'
                });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Nueva tarea');
            expect(res.body.priority).toBe('high');
            expect(res.body._id).toBeDefined();
        });

        it('debería fallar sin título', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ description: 'Sin título' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/tasks', () => {
        it('debería retornar array vacío inicialmente', async () => {
            const res = await request(app).get('/api/tasks');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('debería retornar tareas creadas', async () => {
            // Crear una tarea primero
            await request(app)
                .post('/api/tasks')
                .send({ title: 'Tarea de prueba' });

            const res = await request(app).get('/api/tasks');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].title).toBe('Tarea de prueba');
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('debería retornar una tarea por ID', async () => {
            const createRes = await request(app)
                .post('/api/tasks')
                .send({ title: 'Tarea específica' });

            const taskId = createRes.body._id;

            const res = await request(app).get(`/api/tasks/${taskId}`);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Tarea específica');
        });

        it('debería retornar 404 para ID inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/api/tasks/${fakeId}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/tasks/:id', () => {
        it('debería actualizar una tarea', async () => {
            const createRes = await request(app)
                .post('/api/tasks')
                .send({ title: 'Original' });

            const taskId = createRes.body._id;

            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .send({ title: 'Actualizado', completed: true });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Actualizado');
            expect(res.body.completed).toBe(true);
        });
    });

    describe('PATCH /api/tasks/:id/toggle', () => {
        it('debería alternar el estado completed', async () => {
            const createRes = await request(app)
                .post('/api/tasks')
                .send({ title: 'Toggle test' });

            const taskId = createRes.body._id;
            expect(createRes.body.completed).toBe(false);

            const toggleRes = await request(app)
                .patch(`/api/tasks/${taskId}/toggle`);

            expect(toggleRes.status).toBe(200);
            expect(toggleRes.body.completed).toBe(true);

            // Toggle again
            const toggleRes2 = await request(app)
                .patch(`/api/tasks/${taskId}/toggle`);

            expect(toggleRes2.body.completed).toBe(false);
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('debería eliminar una tarea', async () => {
            const createRes = await request(app)
                .post('/api/tasks')
                .send({ title: 'Para eliminar' });

            const taskId = createRes.body._id;

            const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
            expect(deleteRes.status).toBe(200);

            // Verificar que ya no existe
            const getRes = await request(app).get(`/api/tasks/${taskId}`);
            expect(getRes.status).toBe(404);
        });
    });
});
