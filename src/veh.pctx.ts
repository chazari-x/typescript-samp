import {Keys, Player, Position, Vehicle} from "@sa-mp/core";
import {Command, Context, Import, Key, ParamInt} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class VehPlayer extends Player.Context {
    @Import()
    public readonly mode: ModePlayer;

    @Key(Keys.NO)
    public handleKeyN(): void {
        this.mode.vehicles.destroy();
    }

    @Command("veh", "Create vehicle")
    public veh(@ParamInt("model") model: number, @ParamInt("color1") color1: number, @ParamInt("color2") color2: number): void {
        const {x, y, z}: Position = this.pos;
        const rotation: number = this.angle;
        const vehicle: Vehicle = Vehicle.create({x, y, z, model, colors: [color1, color2], rotation});
        if(this.isInAnyVehicle())
            this.vehicle.destroy();
        this.put(vehicle);
        this.mode.vehicles.push(vehicle);
    }
}