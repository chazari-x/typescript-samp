import {GameMode, Player} from "@sa-mp/core";
import {Mode} from "./mode.gctx";
import {ModePlayer} from "./mode.pctx";
import 'dotenv/config';

export function bootstrap(): void {
    const gamemodeFactory = GameMode.Factory.create(Mode);
    Player.Factory.create(ModePlayer, {gamemodeFactory, commands: true, keys: true, dialogs: true});
}

bootstrap();