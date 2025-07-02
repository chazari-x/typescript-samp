import {Keys, Player, Vehicle} from "@sa-mp/core";
import {Command, Context, Import, Key, ParamInt} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class VehPctx extends Player.Context {
    @Import(() => ModePlayer)
    public readonly player: ModePlayer;

    // Создание транспорта без указания цветов
    @Command("veh", "Создать транспорт")
    public veh(@ParamInt("model") model: number): void {
        if (!this.player.authorized) return

        if (this.isInAnyVehicle()) {
            this.send(`{ff0000}[ERROR]: {ffffff}Вы должны находиться вне транспорта!`);
            return;
        }

        const vehicle = Vehicle.create({
            ...this.pos,
            model,
            colors: [0, 0],
            rotation: this.angle,
        });
        vehicle.params = {
            doors: false,
            engine: false,
            lights: false,
            alarm: false,
            bonnet: false,
            boot: false,
            objective: false
        }

        this.put(vehicle);
        this.send(`{ff5500}[SERVER]: {ffffff}Создан транспорт: ${vehicle.id}.`);
    }

    // Создание транспорта с указанием цветов
    @Command("veh", "Создать транспорт")
    public vehWithColors(
        @ParamInt("model") model: number,
        @ParamInt("color1") color1: number,
        @ParamInt("color2") color2: number
    ): void {
        if (!this.player.authorized) return

        if (this.isInAnyVehicle()) {
            this.send(`{ff0000}[ERROR]: {ffffff}Вы должны находиться вне транспорта!`);
            return;
        }

        const vehicle = Vehicle.create({
            ...this.pos,
            model,
            colors: [color1, color2],
            rotation: this.angle,
        });
        vehicle.params = {
            doors: false,
            engine: false,
            lights: false,
            alarm: false,
            bonnet: false,
            boot: false,
            objective: false
        }

        this.put(vehicle);
        this.send(`{ff5500}[SERVER]: {ffffff}Создан транспорт: ${vehicle.id}. Цвета: ${color1}, ${color2}`);
    }

    // Удаление транспорта по ID
    @Command("delveh", "Удалить транспорт по ID")
    public delvehWithId(@ParamInt("id") id: number): void {
        if (!this.player.authorized) return

        const success = new Vehicle(id).destroy();
        if (success) {
            this.send(`{ff5500}[SERVER]: {ffffff}Удалён транспорт с ID: ${id}`);
        } else {
            this.send(`{ff0000}[ERROR]: {ffffff}Не удалось удалить транспорт с ID: ${id}`);
        }
    }

    // Удаление транспорта, в котором сидит игрок
    @Command("delveh", "Удалить транспорт, в котором вы находитесь")
    public delveh(): void {
        if (!this.player.authorized) return

        if (!this.isInAnyVehicle()) {
            this.send(`{ff0000}[ERROR]: {ffffff}Вы должны находиться в транспорте или указать ID: /delveh [id]`);
            return;
        }

        const id = this.vehicle.id;
        if (this.vehicle.destroy()) {
            this.send(`{ff5500}[SERVER]: {ffffff}Удалён транспорт с ID: ${id}`);
        } else {
            this.send(`{ff0000}[ERROR]: {ffffff}Не удалось удалить транспорт с ID: ${id}`);
        }
    }

    // Починить транспорт по ID
    @Command("fix", "Починить транспорт по ID")
    public fixWithId(@ParamInt("id") id: number): void {
        if (!this.player.authorized) return

        const vehicle = new Vehicle(id);
        if (!vehicle) {
            this.send(`{ff0000}[ERROR]: {ffffff}Не удалось найти транспорт с ID: ${id}`);
        } else if (vehicle.repair()) {
            this.send(`{ff5500}[SERVER]: {ffffff}Вы починили транспорт с ID: ${id}`);
        } else {
            this.send(`{ff0000}[ERROR]: {ffffff}Не удалось починили транспорт с ID: ${id}`);
        }
    }

    // Починить транспорт, в котором вы находитесь
    @Command("fix", "Починить транспорт, в котором вы находитесь")
    public fix(): void {
        if (!this.player.authorized) return

        if (!this.isInAnyVehicle()) {
            this.send(`{ff0000}[ERROR]: {ffffff}Вы должны находиться в транспорте или указать ID: /fix [id]`);
        } else {
            this.vehicle.repair()
        }
    }

    // Починить транспорт, в котором вы находитесь
    @Key(Keys.ACTION)
    @Command("en", "Завести/Заглушить двигатель")
    public en(): void {
        if (!this.player.authorized || !this.isInAnyVehicle()) return

        if (this.vehicle.health <= 350) this.gameText(`The engine is faulty!`, 1000, 4);
        else this.vehicle.params = {...this.vehicle.params, engine: !this.vehicle.params.engine}
    }

    public onVehicleDamageStatusUpdate(vehicle: Vehicle): any {
        if (!this.player.authorized) return;

        if (vehicle.health <= 350) {
            vehicle.health = 350
            this.vehicle.params = {...this.vehicle.params, engine: false}
        }
    }
}
