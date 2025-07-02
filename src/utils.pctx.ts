import {Player} from "@sa-mp/core";
import {Context, Import} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

@Context()
export class UtilsPctx extends Player.Context {
    @Import(() => ModePlayer)
    private readonly mode: ModePlayer;

    public randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}