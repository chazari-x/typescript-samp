import {Player} from "@sa-mp/core";
import {Command, Context, Import, ParamInt} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class WeaponPctx extends Player.Context {
    @Import(() => ModePlayer)
    public readonly mode: ModePlayer;

    @Command("weapon", "Create vehicle")
    public gun(@ParamInt("model") weapon: number, @ParamInt("ammo") ammo: number): void {
        if (!this.mode.authorized) return

        if (this.giveWeapon(weapon, ammo)) {
            this.send(`{ff5500}[SERVER]: {ffffff}Выдано оружие ${WeaponPctx.getWeaponName(weapon, 50)}`)
        } else {
            this.send(`{ff0000}[ERROR]: {ffffff}Использование: /veh (weapon = [1; 54]) (ammo)`)
        }
    }
}