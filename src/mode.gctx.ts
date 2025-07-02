import {GameMode, Player, Vehicle, } from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";
import PostgresClient from "./db/client";
import {CopChase} from "./copchase.gctx";

@Context()
export class Mode extends GameMode.Context {
    public onInit(): void {
        console.log("[Mode] Init!");
        PostgresClient.getInstance();
        Player.addClass({skin: 100, spawn: {x: 0, y: 0, z: 3}, angle: 0, weapons: []});
        Player.stuntBonus = false;
        Vehicle.manualEngineAndLights();
        CopChase.init();
    }
}