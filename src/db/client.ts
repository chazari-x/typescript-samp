import {Client} from 'pg';

class PostgresClient {
    private static instance: PostgresClient;
    private client: Client;

    private constructor() {
        this.client = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'postgrespw',
            database: 'postgres',
        });

        this.client.connect()
            .then(async () => {
                console.log('[Postgres] Connected');

                await this.client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

                // Таблица пользователей
                await this.client.query(`
                    CREATE TABLE IF NOT EXISTS users
                    (
                        id                 SERIAL PRIMARY KEY,
                        login              VARCHAR(64) UNIQUE NOT NULL,
                        password_hash      VARCHAR(128)       NOT NULL,
                        registration_date  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        ban_until_the_date TIMESTAMP
                    );
                `);

                // Таблица админов
                await this.client.query(`
                    CREATE TABLE IF NOT EXISTS admins
                    (
                        user_id INTEGER PRIMARY KEY,
                        lvl     INTEGER NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    );
                `);

                // Таблица миров
                await this.client.query(`
                    CREATE TABLE IF NOT EXISTS worlds
                    (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id     INTEGER         NOT NULL,
                        name        VARCHAR(64)     NOT NULL,
                        description VARCHAR(128),
                        objects     JSON            NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    );
                `);

                await this.client.query(`
                    CREATE TABLE IF NOT EXISTS gamemode
                    (
                        key         VARCHAR(64) PRIMARY KEY,
                        value       VARCHAR(128) NOT NULL,
                        description VARCHAR(128)
                    );
                `);

                console.log('[Postgres] Tables ensured');
            })
            .catch(err => console.error('[Postgres] Connection error:', err));
    }

    public static getInstance(): PostgresClient {
        if (!PostgresClient.instance) {
            PostgresClient.instance = new PostgresClient();
        }
        return PostgresClient.instance;
    }

    // Получить всех пользователей
    public async getUsers(): Promise<User[]> {
        const res = await this.client.query('SELECT * FROM users');
        return res.rows.map(row => ({
            id: row.id,
            login: row.login,
            password_hash: row.password_hash,
            registration_date: new Date(row.registration_date),
            ban_until_the_date: row.ban_until_the_date ? new Date(row.ban_until_the_date) : null
        }));
    }

    // Получить пользователя по логину
    public async getUser(login: string): Promise<User | null> {
        const res = await this.client.query('SELECT * FROM users WHERE login = $1 LIMIT 1', [login]);
        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return {
            id: row.id,
            login: row.login,
            password_hash: row.password_hash,
            registration_date: new Date(row.registration_date),
            ban_until_the_date: row.ban_until_the_date ? new Date(row.ban_until_the_date) : null
        };
    }

    // Добавить нового пользователя и вернуть его
    public async addUser(login: string, passwordHash: string): Promise<User | null> {
        const res = await this.client.query(
            'INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING *',
            [login, passwordHash]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return {
            id: row.id,
            login: row.login,
            password_hash: row.password_hash,
            registration_date: new Date(row.registration_date),
            ban_until_the_date: row.ban_until_the_date ? new Date(row.ban_until_the_date) : null
        };
    }

    // Удалить пользователя по ID
    public async deleteUser(id: number): Promise<void> {
        await this.client.query('DELETE FROM users WHERE id = $1', [id]);
    }

    // Получение списка всех миров (id, name, description)
    public async getWorldsList(): Promise<{ id: string, name: string, description: string }[]> {
        const res = await this.client.query('SELECT id, name, description FROM worlds');
        return res.rows;
    }

    // Получение мира по UUID
    public async getWorld(id: string) {
        const res = await this.client.query('SELECT * FROM worlds WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length === 0) throw new Error("Такого мира не существует!")

        const row = res.rows[0];
        if (!row) throw new Error("Такого мира не существует!")
        return {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            objects: typeof row.objects === 'string' ? JSON.parse(row.objects) : row.objects,
        };
    }

    // Сохранение мира (insert или update по UUID)
    public async saveWorld(world: Partial<World>): Promise<string> {
        if (!world.id) {
            const res = await this.client.query(`
            INSERT INTO worlds (user_id, name, description, objects)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [
                world.user_id,
                world.name ?? 'Untitled',
                world.description ?? '',
                JSON.stringify(world.objects ?? [])
            ]);

            return res.rows[0].id;
        } else {
            await this.client.query(`
            INSERT INTO worlds (id, user_id, name, description, objects)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id)
            DO UPDATE SET
                user_id = EXCLUDED.user_id,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                objects = EXCLUDED.objects
        `, [
                world.id,
                world.user_id,
                world.name,
                world.description,
                JSON.stringify(world.objects),
            ]);

            return world.id;
        }
    }

    // Удаление мира по UUID
    public async deleteWorld(id: string): Promise<void> {
        await this.client.query('DELETE FROM worlds WHERE id = $1', [id]);
    }

    public async close() {
        await this.client.end();
        console.log('[Postgres] Disconnected');
    }
}

export interface User {
    id: number,
    login: string,
    password_hash: string,
    registration_date: Date,
    ban_until_the_date: Date | null
}

export interface World {
    id: string,
    user_id: number,
    name: string,
    description: string,
    objects: WorldObject[],
}

export interface WorldObject {
    id: number,
    x: number, y: number, z: number,
    model: number,
    drawDistance?: number,
    rot: { x: number, y: number, z: number },
    attach?: {
        offset: { x: number, y: number, z: number }
        rot: { x: number, y: number, z: number }
        syncRotation?: boolean
    }
}

export default PostgresClient;
