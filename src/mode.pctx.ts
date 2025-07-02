import {
    CommandList,
    DialogResponse,
    DialogStyles,
    Group,
    Player,
    SampObject,
    ShowDialogOptions,
    TextDraw
} from "@sa-mp/core";
import {Context, Import} from "@sa-mp/decorators";
import {VehPctx} from "./veh.pctx";
import PostgresClient, {User, World} from "./db/client";
import {WeaponPctx} from "./weapon.pctx";
import {ObjectPctx} from "./object.pctx";
import {WorldPctx} from "./world.pctx";
import {AnimPctx} from "./anims.pctx";
import {CopchasePctx} from "./copchase.pctx";
import {UtilsPctx} from "./utils.pctx";


@Context([VehPctx, WeaponPctx, ObjectPctx, WorldPctx, AnimPctx, CopchasePctx, UtilsPctx])
export class ModePlayer extends Player.Context {
    @Import(() => CopchasePctx)
    public readonly copchase: CopchasePctx;
    @Import(() => UtilsPctx)
    public readonly utils: UtilsPctx;

    public passwordAttempts: number = 0;
    public db = PostgresClient.getInstance();
    public db_user: User | null = null
    public db_world: World | undefined = undefined;
    public db_world_objects: Group<SampObject> = new Group();
    public authorized: boolean = false;

    welcomeTextDraw = TextDraw.create({
        text: "czo.ooo",
        x: 630,
        y: 430,
        color: 0xffffffAA,
        backgroundColor: 0x000000AA,
        proportional: true,
        font: 2,
        align: 3,
    });

    stopAnimTextDraw = TextDraw.create({
        text: "Press SPACE to stop animation",
        x: 320,
        y: 430,
        color: 0xffffffAA,
        backgroundColor: 0x000000AA,
        proportional: true,
        font: 2,
        align: 2,
    });

    public onConnect(): boolean {
        this.stuntBonus = false
        this.db.getUser(this.name)
            .then((user) => {
                this.db_user = user
                if (!!user) this.showLogin()
                else this.showRegistration()
            })
            .catch((e) => {
                console.error(e)
                this.send(`{ff0000}[ERROR]: {ffffff}Ошибка при получении пользователя: ${e.message}`);
                this.kick()
            })
        this.welcomeTextDraw.show(this);
        this.spectating = true;
        return true;
    }

    public onDisconnect(): void {

    }

    public onDialogResponse(res: DialogResponse): any {
        switch (res.id) {
            case (1): {
                if (!res.response) this.kick()
                else if (!!this.db_user && res.inputText == this.db_user.password_hash) {
                    this.send(`{ff5500}[SERVER]: {ffffff}Вы успешно авторизовались, ${this.name}!`);
                    this.spectating = false;
                    this.authorized = true;
                    setTimeout(this.spawn, 100)
                } else {
                    this.send(`{ff0000}[ERROR]: {ffffff}Введен неверный пароль: ${++this.passwordAttempts}/3`);
                    if (this.passwordAttempts >= 3) setTimeout(this.kick, 100);
                    else setTimeout(this.showLogin, 100);
                }
                return 0
            }
            case (2): {
                if (!res.response) this.kick()
                else if (res.inputText.length <= 5) {
                    this.send(`{ff0000}[ERROR]: {ffffff}Парольдолжен быть длинне 5 символов!`);
                    setTimeout(this.showRegistration, 100);
                } else if (res.inputText.length > 5) {
                    this.db.addUser(this.name, res.inputText)
                        .then((user) => {
                            this.db_user = user
                            this.spectating = false;
                            this.send(`{ff5500}[SERVER]: {ffffff}Вы успешно зарегистрировались!`);
                            setTimeout(this.spawn, 100)
                        })
                        .catch((e) => {
                            console.error(e)
                        })

                }
                return 0
            }
            default:
        }
    }

    showLogin = () => {
        this.dialog({
            id: 1,
            style: DialogStyles.PASSWORD,
            caption: "{ff0000}Авторизация аккаунта",
            info: `{FFFFFF}Доброго времени суток! Вас приветствует сервер!
{FFFFFF}Чтобы начать игру на сервере пройдите авторизацию.
{FFFFFF}Введите ваш пароль, который вводили при регистрации!
            
{ff0000}[ВНИМАНИЕ]: {FFFFFF}Если вы забыли пароль от аккаунта, то обратитесь к старшим на форуме!`,
            buttons: ["{ffffff}Войти", "{ffffff}Выйти"]
        } as ShowDialogOptions)
    }

    showRegistration = () => {
        this.dialog({
            id: 2,
            style: DialogStyles.PASSWORD,
            caption: "{ff0000}Регистрация аккаунта",
            info: `{FFFFFF}Доброго времени суток! Вас приветствует сервер!
{FFFFFF}Чтобы начать игру на сервере пройдите регистраицю.`,
            buttons: ["{ffffff}Зарегистрироваться", "{ffffff}Выйти"]
        } as ShowDialogOptions)
    }

    onCommandParamsMismatch(cmdList: CommandList): any {
        if (cmdList.desc) {
            this.send(`{FF0000}[ERROR]: {ffffff}Неверные параметры для команды ${cmdList.name} (${cmdList.desc}):`);
        }

        const grouped: Record<string, { name: string, params: { name: string, type: string }[][] }> = {};

        for (const cmd of cmdList) {
            if (!grouped[cmd.name]) {
                grouped[cmd.name] = {
                    name: cmd.name,
                    params: []
                };
            }
            grouped[cmd.name].params.push(cmd.params);
        }

        for (const group of Object.values(grouped)) {
            const maxParams = Math.max(...group.params.map(p => p.length));
            const mergedParams: string[] = [];

            for (let i = 0; i < maxParams; i++) {
                const paramAtIndex = group.params.map(p => p[i]);

                const existingParams = paramAtIndex.filter(Boolean);
                const firstParam = existingParams[0];

                if (!firstParam) {
                    mergedParams.push("*");
                    continue;
                }

                const sameName = existingParams.every(p => p.name === firstParam.name);
                const sameType = existingParams.every(p => p.type === firstParam.type);
                const occursInAll = group.params.every(p => p[i]);

                const typeName = Player.command.paramTypeNames[firstParam.type];

                if (sameName && sameType) {
                    mergedParams.push(`<${firstParam.name}: ${typeName}>${occursInAll ? "" : "*"}`);
                } else {
                    mergedParams.push("*");
                }
            }

            this.send(`{ff5500}[SERVER]: {ffffff}/${group.name} {dbce12}${mergedParams.join(" ")}`);
        }

        return 1;
    }

    onCommandInvalid(): any {
        if (!this.authorized) return

        this.send("{FF0000}[ERROR]: {ffffff}Неверная команды.");
        return 1
    }

    onCommandNotFound(name: string): any {
        if (!this.authorized) return

        this.send(`{FF0000}[ERROR]: {FFFFFF}Команды {dbce12}/${name}{FFFFFF} не найдена.`);
        return 1
    }
}