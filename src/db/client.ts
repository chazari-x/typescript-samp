import { Pool } from 'pg';

class PostgresClient {
    private static instance: PostgresClient;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionTimeoutMillis: 5000,
            ssl: false,
        });

        this.pool.connect()
            .then(async client => {
                console.log('[Postgres] Connected');
                await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS samp_users (
                                                              id SERIAL PRIMARY KEY,
                                                              login VARCHAR(64) UNIQUE NOT NULL,
                                                              password_hash VARCHAR(128) NOT NULL,
                                                              registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                              ban_until_the_date TIMESTAMP
                    );
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS samp_admins (
                                                               user_id INTEGER PRIMARY KEY,
                                                               lvl INTEGER NOT NULL,
                                                               FOREIGN KEY (user_id) REFERENCES samp_users (id) ON DELETE CASCADE
                    );
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS samp_worlds (
                                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                               user_id INTEGER NOT NULL,
                                                               name VARCHAR(64) NOT NULL,
                                                               description VARCHAR(128),
                                                               objects JSON NOT NULL,
                                                               FOREIGN KEY (user_id) REFERENCES samp_users (id) ON DELETE CASCADE
                    );
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS gamemode (
                                                            key VARCHAR(64) PRIMARY KEY,
                                                            value VARCHAR(128) NOT NULL,
                                                            description VARCHAR(128)
                    );
                `);

                client.release();
                console.log('[Postgres] Tables ensured');
            })
            .catch(err => {
                console.error('[Postgres] Connection error:', err);
            })
            .finally(() => {
                console.log('[Postgres] Connection attempt finished');
            });
    }

    public static getInstance(): PostgresClient {
        if (!PostgresClient.instance) {
            PostgresClient.instance = new PostgresClient();
        }
        return PostgresClient.instance;
    }

    public async getUsers(): Promise<User[]> {
        const res = await this.pool.query('SELECT * FROM samp_users');
        return res.rows.map(row => ({
            id: row.id,
            login: row.login,
            password_hash: row.password_hash,
            registration_date: new Date(row.registration_date),
            ban_until_the_date: row.ban_until_the_date ? new Date(row.ban_until_the_date) : null
        }));
    }

    public async getUser(login: string): Promise<User | null> {
        const res = await this.pool.query('SELECT * FROM samp_users WHERE login = $1 LIMIT 1', [login]);
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

    public async addUser(login: string, passwordHash: string): Promise<User | null> {
        const res = await this.pool.query(
            'INSERT INTO samp_users (login, password_hash) VALUES ($1, $2) RETURNING *',
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

    public async deleteUser(id: number): Promise<void> {
        await this.pool.query('DELETE FROM samp_users WHERE id = $1', [id]);
    }

    public async getWorldsList(): Promise<{ id: string, name: string, description: string }[]> {
        const res = await this.pool.query('SELECT id, name, description FROM samp_worlds');
        return res.rows;
    }

    public async getWorld(id: string) {
        const res = await this.pool.query('SELECT * FROM samp_worlds WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length === 0) throw new Error("Такого мира не существует!");

        const row = res.rows[0];
        return {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            objects: typeof row.objects === 'string' ? JSON.parse(row.objects) : row.objects,
        };
    }

    public async saveWorld(world: Partial<World>): Promise<string> {
        if (!world.id) {
            const res = await this.pool.query(`
                INSERT INTO samp_worlds (user_id, name, description, objects)
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
            await this.pool.query(`
                INSERT INTO samp_worlds (id, user_id, name, description, objects)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET
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

    public async deleteWorld(id: string): Promise<void> {
        await this.pool.query('DELETE FROM samp_worlds WHERE id = $1', [id]);
    }

    public async close() {
        await this.pool.end();
        console.log('[Postgres] Disconnected');
    }
}

export interface User {
    id: number;
    login: string;
    password_hash: string;
    registration_date: Date;
    ban_until_the_date: Date | null;
}

export interface World {
    id: string;
    user_id: number;
    name: string;
    description: string;
    objects: WorldObject[];
}

export interface WorldObject {
    id: number;
    x: number, y: number, z: number;
    model: number;
    drawDistance?: number;
    rot: { x: number, y: number, z: number };
    attach?: {
        offset: { x: number, y: number, z: number };
        rot: { x: number, y: number, z: number };
        syncRotation?: boolean;
    };
}

export default PostgresClient;
