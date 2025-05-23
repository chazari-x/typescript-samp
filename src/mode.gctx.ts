import {GameMode, Player, Weapons} from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";
import PostgresClient from "./db/client";

@Context()
export class Mode extends GameMode.Context {
    public onInit(): void {
        console.log("[Mode] Init!");
        PostgresClient.getInstance()
        Player.addClass({skin: 100, spawn: {x: 0, y: 0, z: 3}, angle: 0, weapons: [{type: Weapons.DEAGLE, ammo: 999}]});
    }
}