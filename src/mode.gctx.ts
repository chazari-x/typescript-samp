import {GameMode, Player, Weapons} from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";

@Context()
export class Mode extends GameMode.Context {
    public onInit(): void {
        console.log("[Mode] Init!");
        Player.addClass({skin: 100, spawn: {x: 1657.7761, y: -1842.0952, z: 13.5463}, angle: 0, weapons: [{type: Weapons.KATANA, ammo: 1}]});
    }
}