import {DialogResponse, DialogStyles, Keys, Player, ShowDialogOptions} from "@sa-mp/core";
import {Command, Context, Import, Key} from "@sa-mp/decorators";
import {ModePlayer} from "./mode.pctx";

const ANIMATIONS: Record<string, (
    { name: string; description: string }
    & ({ id: number; lib: "special" } | { lib: string; }))> = {
    // duck: { id: 1, lib: "special", name: "DUCK", description: "Ducking animation" },
    // jetpack: { id: 2, lib: "special", name: "USEJETPACK", description: "Using a jetpack" },
    // enter: { id: 3, lib: "special", name: "ENTER_VEHICLE", description: "Entering a vehicle" },
    // exit: { id: 4, lib: "special", name: "EXIT_VEHICLE", description: "Exiting a vehicle" },
    dance1: { id: 5, lib: "special", name: "DANCE1", description: "Dance animation 1" },
    dance2: { id: 6, lib: "special", name: "DANCE2", description: "Dance animation 2" },
    dance3: { id: 7, lib: "special", name: "DANCE3", description: "Dance animation 3" },
    dance4: { id: 8, lib: "special", name: "DANCE4", description: "Dance animation 4" },
    handsup: { id: 10, lib: "special", name: "HANDSUP", description: "Putting hands up" },
    phone: { id: 11, lib: "special", name: "USECELLPHONE", description: "Using cellphone" },
    // sit: { id: 12, lib: "special", name: "SITTING", description: "Sitting animation" },
    // stophone: { id: 13, lib: "special", name: "STOPUSECELLPHONE", description: "Stopping cellphone use" },
    // beer: { id: 20, lib: "special", name: "DRINK_BEER", description: "Drinking beer" },
    // smoke: { id: 21, lib: "special", name: "SMOKE_CIGGY", description: "Smoking cigarette" },
    // wine: { id: 22, lib: "special", name: "DRINK_WINE", description: "Drinking wine" },
    // sprunk: { id: 23, lib: "special", name: "DRINK_SPRUNK", description: "Drinking Sprunk" },
    cuffed: { id: 24, lib: "special", name: "CUFFED", description: "Handcuffed animation" },
    carry: { id: 25, lib: "special", name: "CARRY", description: "Carrying something" }
};

@Context()
export class AnimPctx extends Player.Context {
    @Import(() => ModePlayer)
    public readonly mode: ModePlayer;

    @Command("animlist", "Открыть диалог анимаций")
    public showAnimDialog(): void {
        if (!this.mode.authorized) return

        const entries = Object.entries(ANIMATIONS);
        const list = entries.map(([key, anim]) => `${key} - ${anim.description}`).join("\n");

        this.dialog({
            id: 3,
            style: DialogStyles.LIST,
            caption: "Выбор анимации",
            info: list,
            buttons: ["Выбрать", "Отмена"],
        } as ShowDialogOptions);
    }

    public onDialogResponse(res: DialogResponse): void {
        if (!this.mode.authorized) return
        if (res.id !== 3) return;

        const entries = Object.entries(ANIMATIONS);
        // Добавляем проверку на существование индекса
        if (res.item < 0 || res.item >= entries.length) return;

        const [_key, anim] = entries[res.item];
        this.clearAnims();
        this.specialAction = 0;

        if (anim.lib === "special" && 'id' in anim) {
            this.specialAction = anim.id;
            this.mode.stopAnimTextDraw.show(this);
            setTimeout(() => this.mode.stopAnimTextDraw.hide(this), 5000);
        } else {
            this.anim({
                forceSync: false,
                lockX: false,
                lockY: false,
                time: 0,
                library: anim.lib,
                name: anim.name,
                loop: true,
                freeze: false
            });
        }
    }

    @Command("stopanim", "Остановить анимацию")
    public stopanim(): void {
        if (!this.mode.authorized) return

        this.clearAnims();
        this.specialAction = 0;
    }

    // Слушаем изменение состояния клавиш
    @Key(Keys.SPRINT)
    public onKeyStateChange(): void {
        if (!this.mode.authorized) return

        //     if (!Object.values(ANIMATIONS).find(a => a.lib != "special" && this.animIndex())) return
    //     this.specialAction = 0;
    }
}

// Динамически добавляем команды
for (const [cmd, anim] of Object.entries(ANIMATIONS)) {
    // Создаем функцию с именем cmd_<анимация>
    (AnimPctx.prototype as any)[`cmd_${cmd}`] = function (this: AnimPctx) {
        if (!this.mode.authorized) return

        this.specialAction = 0;
        this.clearAnims();
        this.anim({
            forceSync: false,
            lockX: false,
            lockY: false,
            time: 0,
            library: anim.lib,
            name: anim.name,
            loop: true,
            freeze: false
        });
    };

    // Применяем декоратор Command с 2 аргументами
    Command(cmd, `Запустить анимацию '${cmd}'`)(
        AnimPctx.prototype,
        `cmd_${cmd}`
    );
}