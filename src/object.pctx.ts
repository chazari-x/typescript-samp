import {ObjectOptions, Player, SampObject} from "@sa-mp/core";
import {Alt, Command, Context, Import, ParamInt} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class ObjectPctx extends Player.Context {
    @Import(() => ModePlayer)
    public readonly mode: ModePlayer;

    @Command("oa(dd)", "Создать объект")
    @Alt("oa", "oadd")
    public add(@ParamInt("model") model: number): void {
        if (!this.mode.authorized) return

        try {
            const object = new SampObject({
                ...this.pos,
                model: model,
                rot: {x: 0, y: 0, z: 0}
            } as ObjectOptions).create();

            this.mode.db_world_objects.push(object)

            this.send(`{ff5500}[SERVER]: {ffffff}Создан объект: ${object.id}.`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при создании объекта.");
            console.error(e);
        }
    }

    @Command("tpo", "Телепорт к объекту")
    public tp(@ParamInt("id") id: number): void {
        if (!this.mode.authorized) return

        try {
            const obj = SampObject.getById(id);
            if (!obj) {
                this.send(`{ff5500}[ERROR]: {ffffff}Объект с ID ${id} не найден.`);
                return;
            }
            this.pos = obj.pos;
            this.send(`{ff5500}[SERVER]: {ffffff}Телепортация к объекту ID ${id}.`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при телепортации к объекту.");
            console.error(e);
        }
    }

    @Command("od(ell)", "Удаление объекта")
    @Alt("od", "odell")
    public dell(@ParamInt("id") id: number): void {
        if (!this.mode.authorized) return

        try {
            const obj = SampObject.getById(id);
            if (!obj) {
                this.send(`{ff5500}[ERROR]: {ffffff}Объект с ID ${id} не найден.`);
                return;
            }
            this.mode.db_world_objects.filter(o => o.id != obj.id)
            obj.destroy();
            this.send(`{ff5500}[SERVER]: {ffffff}Объект ID ${id} удалён. Объектов: ${(this.mode.db_world_objects ?? []).length}`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при удалении объекта.");
            console.error(e);
        }
    }

    @Command("oe(dit)", "Редактирование объекта")
    @Alt("oe", "oedit")
    public edit(@ParamInt("id") id: number): void {
        if (!this.mode.authorized) return

        try {
            const obj = SampObject.getById(id);
            if (!obj) {
                this.send(`{ff5500}[ERROR]: {ffffff}Объект с ID ${id} не найден.`);
                return;
            }
            obj.edit(this)
            this.send(`{ff5500}[SERVER]: {ffffff}Редактирование объекта ID ${id} начато.`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при редактировании объекта.");
            console.error(e);
        }
    }

    @Command("oi(nfo)", "Информация об объекте")
    @Alt("oi", "oinfo")
    public info(@ParamInt("id") id: number): void {
        if (!this.mode.authorized) return

        try {
            const obj = SampObject.getById(id);
            if (!obj) {
                this.send(`{ff5500}[ERROR]: {ffffff}Объект с ID ${id} не найден.`);
                return;
            }

            this.send(`{ff5500}[SERVER]: {ffffff}Model: ${obj.model}. X: ${obj.pos.x.toFixed(2)}, Y: ${obj.pos.y.toFixed(2)}, Z: ${obj.pos.z.toFixed(2)}, rX: ${obj.rot.x.toFixed(2)}, rY: ${obj.rot.y.toFixed(2)}, rZ: ${obj.rot.z.toFixed(2)}`);
        } catch (e) {
            this.send("{ff5500}[ERROR]: {ffffff}Ошибка при выборе объекта.");
            console.error(e);
        }
    }
}
