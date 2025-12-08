import { Task } from '../../models/Task.js';

describe('Task Model', () => {
    describe('Validaciones', () => {
        it('debería crear una tarea con campos válidos', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium' as const
            };

            const task = new Task(taskData);
            const savedTask = await task.save();

            expect(savedTask._id).toBeDefined();
            expect(savedTask.title).toBe(taskData.title);
            expect(savedTask.description).toBe(taskData.description);
            expect(savedTask.priority).toBe(taskData.priority);
            expect(savedTask.completed).toBe(false);
            expect(savedTask.createdAt).toBeDefined();
        });

        it('debería fallar sin título', async () => {
            const task = new Task({ description: 'Sin título' });

            await expect(task.save()).rejects.toThrow();
        });

        it('debería fallar con prioridad inválida', async () => {
            const task = new Task({
                title: 'Test',
                priority: 'invalid'
            });

            await expect(task.save()).rejects.toThrow();
        });

        it('debería fallar si el título excede 100 caracteres', async () => {
            const longTitle = 'a'.repeat(101);
            const task = new Task({ title: longTitle });

            await expect(task.save()).rejects.toThrow();
        });

        it('debería usar valores por defecto correctos', async () => {
            const task = new Task({ title: 'Test' });
            const savedTask = await task.save();

            expect(savedTask.completed).toBe(false);
            expect(savedTask.priority).toBe('medium');
            expect(savedTask.dueDate).toBeNull();
        });
    });

    describe('Campos opcionales', () => {
        it('debería guardar dueDate correctamente', async () => {
            const dueDate = new Date('2024-12-31');
            const task = new Task({
                title: 'Task con fecha',
                dueDate
            });
            const savedTask = await task.save();

            expect(savedTask.dueDate).toEqual(dueDate);
        });

        it('debería actualizar completed a true', async () => {
            const task = new Task({ title: 'Test' });
            await task.save();

            task.completed = true;
            const updatedTask = await task.save();

            expect(updatedTask.completed).toBe(true);
        });
    });
});
