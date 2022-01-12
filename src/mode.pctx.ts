import {Group, Player, Vehicle} from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";
import {VehPlayer} from "./veh.pctx";

@Context([VehPlayer])
export class ModePlayer extends Player.Context {
    public readonly vehicles: Group<Vehicle> = new Group;

    public onConnect(): boolean {
        this.send(`Hello, ${this}!`);
        return true;
    }

    public onDisconnect(): void {
        this.vehicles.destroy();
    }
}