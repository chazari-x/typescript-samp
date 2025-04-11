import {DialogResponse, DialogStyles, Group, Player, ShowDialogOptions, Vehicle} from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";
import {VehPlayer} from "./veh.pctx";

@Context([VehPlayer])
export class ModePlayer extends Player.Context {
    public readonly vehicles: Group<Vehicle> = new Group;
    public passwordAttempts: number = 0;

    public onConnect(): boolean {
        this.send(`Hello, ${this}!`);
        this.showLogin();
        this.spectating = true;
        return true;
    }

    public onDisconnect(): void {
        this.vehicles.destroy();
    }

    public onDialogResponse(res: DialogResponse): any {
        switch (res.id) {
            case (1): {
                if (!res.response) this.kick()
                else if (res.inputText != "qweqwe123") {
                    this.send(`{ff0000}[ERROR]: {ffffff}Введен неверный пароль: ${++this.passwordAttempts}/3`);
                    if (this.passwordAttempts >= 3) setTimeout(this.kick, 100);
                    else setTimeout(this.showLogin, 100);
                } else {
                    this.spectating = false;
                    setTimeout(this.spawn, 100)
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
            buttons: ["{ffffff}Далее", "{ffffff}Выход"]
        } as ShowDialogOptions)
    }
}