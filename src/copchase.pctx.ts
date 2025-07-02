import {Player, Vehicle} from "@sa-mp/core";
import {Command, Context, Import} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";
import {CopChase} from "./copchase.gctx";

@Context()
export class CopchasePctx extends Player.Context {
    @Import(() => ModePlayer)
    private readonly player: ModePlayer;

    @Command("ch", "Войти в режим CopChase")
    public ch(): void {
        if (!this.player.authorized) return;

        if (CopChase.isInGame(this)) {
            this.send("{00ccff}[COPCHASE] {ffffff}Вы уже участвуете в CopChase.");
        } else {
            CopChase.join(this);
        }

    }

    @Command("exit", "Выйти из режима CopChase")
    public exit(): void {
        if (!this.player.authorized) return;

        if (!CopChase.isInGame(this)) {
            this.send("{00ccff}[COPCHASE] {ffffff}Вы не участвуете в CopChase.");
        } else {
            CopChase.leave(this);
        }
    }

    public onVehicleDamageStatusUpdate(vehicle: Vehicle): any {
        if (!this.player.authorized) return;
        if (CopChase.isSuspect(this) && vehicle.health <= 350) CopChase.giveGuns()
    }

    public onExitVehicle(vehicle: Vehicle): any {
        if (!this.player.authorized) return;
        if (CopChase.isSuspect(this)) CopChase.giveGuns()
    }
}
