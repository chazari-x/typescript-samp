import {GameMode} from "@sa-mp/core";
import {Context} from "@sa-mp/decorators";

@Context()
export class Mode extends GameMode.Context {
    public onInit(): void {
        console.log("[Mode] Init!");
    }
}