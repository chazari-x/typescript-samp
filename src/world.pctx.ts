import {ObjectOptions, Player, SampObject} from "@sa-mp/core";
import {Alt, Command, Context, Import, ParamString} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class WorldPctx extends Player.Context {
    @Import(() => ModePlayer)
    public readonly mode: ModePlayer;

    @Command("savew(orld)", "Сохранить мир")
    @Alt("savew", "saveworld")
    public save(): void {
        if (!this.mode.authorized) return

        try {
            this.send(`{ff5500}[SERVER]: {ffffff}Начался процесс сохранения мира...`);
            this.mode.db.saveWorld({
                id: this.mode.db_world?.id,
                user_id: this.mode.db_user!.id,
                name: "test",
                description: "",
                objects: this.mode.db_world_objects.map((object) => {
                    return {
                        ...object.pos,
                        id: object.id,
                        model: object.model,
                        rot: object.rot,
                        attach: (object.idOrOptions as ObjectOptions).attach,
                        drawDistance: (object.idOrOptions as ObjectOptions).drawDistance
                    }
                }),
            })
                .then((id) => {
                    this.send(`{ff5500}[SERVER]: {ffffff}Мир сохранен: ${id}`);
                })
                .catch((e) => {
                    console.error(e)
                    this.send(`{ff5500}[ERROR]: {ffffff}${e.message}`);
                })
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при сохранении мира.");
            console.error(e);
        }
    }

    @Command("loadw(orld)", "Загрузить мир")
    @Alt("loadw", "loadworld")
    public load(@ParamString("id") id: string): void {
        if (!this.mode.authorized) return

        try {
            this.send(`{ff5500}[SERVER]: {ffffff}Начался процесс загрузки мира...`);
            this.mode.db.getWorld(id)
                .then((world) => {
                    this.send(`{ff5500}[SERVER]: {ffffff}Получен мир: ${world.name}.`);
                    this.mode.db_world = world
                    for (const obj of (world?.objects ?? [])) {
                        const object = new SampObject(obj).create();
                        this.mode.db_world_objects.push(object)
                    }
                    this.send(`{ff5500}[SERVER]: {ffffff}Создано объектов: ${(world?.objects ?? []).length}.`);
                })
                .catch((e) => {
                    console.error(e)
                    this.send(`{ff5500}[ERROR]: {ffffff}${e.message}`);
                })
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при получении мира.");
            console.error(e);
        }
    }

    @Command("clearw(orld)", "Очистить мир")
    @Alt("clearw", "clearworld")
    public clear(): void {
        if (!this.mode.authorized) return

        try {
            this.send(`{ff5500}[SERVER]: {ffffff}Начался процесс очистки мира...`);
            this.mode.db_world_objects.destroy()
            this.send(`{ff5500}[SERVER]: {ffffff}Объекты удалены.`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при очистке мира.");
            console.error(e);
        }
    }

    @Command("delw(orld)", "Удалить мир")
    @Alt("delw", "delworld")
    public del(): void {
        if (!this.mode.authorized) return

        try {
            if (!this.mode.db_world?.id) {
                this.send(`{ff5500}[SERVER]: {ffffff}Мир не сохранен, удаление невозможно.`);
                return
            }
            this.send(`{ff5500}[SERVER]: {ffffff}Начался процесс удаления мира...`);
            this.mode.db_world_objects.destroy()
            this.send(`{ff5500}[SERVER]: {ffffff}Объекты удалены.`);
            this.mode.db.deleteWorld(this.mode.db_world.id)
                .then(() => {
                    this.send(`{ff5500}[SERVER]: {ffffff}Сохранение удалено: ${this.mode.db_world!.id}`);
                    this.mode.db_world = undefined
                })
                .catch((e) => {
                    console.error(e)
                    this.send(`{ff5500}[ERROR]: {ffffff}${e.message}`);
                })
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при удалении мира.");
            console.error(e);
        }
    }
}
