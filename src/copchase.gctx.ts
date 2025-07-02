import {GangZone, Group, Player, Vehicle, Weapons} from "@sa-mp/core";
import {DynamicObject} from "@sa-mp/streamer";

export class CopChase {
    private static vehicles = new Group<Vehicle>()
    private static players = new Set<Player>();
    private static suspect: Player | null = null;
    private static weapons = false;
    private static active: number = 0;
    private static minPlayers = 2;
    private static suspectTimer: ReturnType<typeof setInterval> | null = null;
    private static pendingStartTime: number = 0;

    private static lobbyObject: DynamicObject | null = null;
    private static readonly lobbyWorld = 1000;
    private static readonly lobbyObjectPos = {x: -1357.93, y: 1.22, z: 8.63};
    private static readonly lobbyObjectModel = 19483;
    private static readonly tagColor = "{00ccff}";
    private static lobbyObjectText = "";
    private static city = "sf"
    private static suspectInGangZoneAlive = 11;

    private static gangZones: Record<string, Group<GangZone>> = {
        ls: new Group(
            new GangZone({min: {x: -3000, y: -15}, max: {x: 3000, y: 3000}}),
            new GangZone({min: {x: -3000, y: -3000}, max: {x: 70, y: -15}}),
            new GangZone({min: {x: 70, y: -994}, max: {x: 479, y: -15}}),
            new GangZone({min: {x: 479, y: -789}, max: {x: 773, y: -15}}),
            new GangZone({min: {x: 773, y: -603}, max: {x: 1262, y: -15}}),
            new GangZone({min: {x: 773, y: -735}, max: {x: 843, y: -603}}),
            new GangZone({min: {x: 1262, y: -408}, max: {x: 3000, y: -15}}),
            new GangZone({min: {x: 1748, y: -802}, max: {x: 3000, y: -408}}),
            new GangZone({min: {x: 1804, y: -920}, max: {x: 3000, y: -802}}),
            new GangZone({min: {x: 1262, y: -463}, max: {x: 1404, y: -408}}),
            new GangZone({min: {x: 1262, y: -500}, max: {x: 1310, y: -463}}),
            new GangZone({min: {x: 843, y: -635}, max: {x: 960, y: -603}}),
            new GangZone({min: {x: 2120, y: -955}, max: {x: 2434, y: -920}}),
            new GangZone({min: {x: 1860, y: -974}, max: {x: 1961, y: -920}}),
            new GangZone({min: {x: 70, y: -1449}, max: {x: 111, y: -994}}),
            new GangZone({min: {x: 111, y: -1187}, max: {x: 147, y: -994}}),
            new GangZone({min: {x: 147, y: -1128}, max: {x: 181, y: -994}}),
            new GangZone({min: {x: 181, y: -1050}, max: {x: 219, y: -994}}),
            new GangZone({min: {x: 479, y: -878}, max: {x: 648, y: -789}})
        ),
        sf: new Group(
            new GangZone({min: {x: -3000, y: -3000}, max: {x: -2241, y: -891}}),
            new GangZone({min: {x: -2241, y: -3000}, max: {x: 3000, y: -1374}}),
            new GangZone({min: {x: -2241, y: -1374}, max: {x: -2035, y: -1274}}),
            new GangZone({min: {x: -2241, y: -1274}, max: {x: -2089, y: -1174}}),
            new GangZone({min: {x: -2241, y: -1174}, max: {x: -2138, y: -1074}}),
            new GangZone({min: {x: -2241, y: -1074}, max: {x: -2180, y: -1021}}),
            new GangZone({min: {x: -2035, y: -1374}, max: {x: -2005, y: -1322}}),
            new GangZone({min: {x: -2005, y: -1374}, max: {x: -1972, y: -1333}}),
            new GangZone({min: {x: -2089, y: -1274}, max: {x: -2056, y: -1233}}),
            new GangZone({min: {x: -2138, y: -1174}, max: {x: -2105, y: -1133}}),
            new GangZone({min: {x: -1784, y: -1374}, max: {x: 3000, y: -713}}),
            new GangZone({min: {x: -3000, y: 1548}, max: {x: 3000, y: 3000}}),
            new GangZone({min: {x: -1090, y: -715}, max: {x: 2999.9723, y: 1548}}),
            new GangZone({min: {x: -1225, y: -713}, max: {x: -1088, y: -613}}),
            new GangZone({min: {x: -1197, y: -613}, max: {x: -1090, y: -513}}),
            new GangZone({min: {x: -1155, y: -513}, max: {x: -1090, y: -460}}),
            new GangZone({min: {x: -1127, y: -460}, max: {x: -1090, y: -428}}),
            new GangZone({min: {x: -1607, y: 1362}, max: {x: -1090, y: 1548}}),
            new GangZone({min: {x: -1445, y: 1026}, max: {x: -1090, y: 1362}}),
            new GangZone({min: {x: -1403, y: 526}, max: {x: -1090, y: 1026}}),
            new GangZone({min: {x: -2564, y: 1448}, max: {x: -1975, y: 1548}}),
            new GangZone({min: {x: -3000, y: 1348}, max: {x: -2754, y: 1548}}),
            new GangZone({min: {x: -1839, y: -1127}, max: {x: -1784, y: -713}}),
            new GangZone({min: {x: -1858, y: -1374}, max: {x: -1784, y: -1301}})
        ),
        lv: new Group(
            new GangZone({min: {x: -3000, y: -3000}, max: {x: -1948, y: 2034}}),
            new GangZone({min: {x: -1948, y: -3000}, max: {x: 3000, y: 523}}),
            new GangZone({min: {x: -1948, y: 523}, max: {x: -1260, y: 1622}}),
            new GangZone({min: {x: -3000, y: 2027}, max: {x: 859, y: 3000}}),
            new GangZone({min: {x: -1983, y: 460}, max: {x: 859, y: 2072}}),
            new GangZone({min: {x: 1298, y: 2404}, max: {x: 1722, y: 2504}}),
            new GangZone({min: {x: 1698, y: 2420}, max: {x: 1798, y: 2520}}),
            new GangZone({min: {x: 1758, y: 2461}, max: {x: 1858, y: 2561}}),
            new GangZone({min: {x: 1858, y: 2470}, max: {x: 1958, y: 2570}}),
            new GangZone({min: {x: 1958, y: 2490}, max: {x: 2058, y: 2590}}),
            new GangZone({min: {x: 2034, y: 2519}, max: {x: 2134, y: 2619}}),
            new GangZone({min: {x: 2091, y: 2544}, max: {x: 2191, y: 2644}}),
            new GangZone({min: {x: 2151, y: 2566}, max: {x: 2251, y: 2666}}),
            new GangZone({min: {x: 2251, y: 2572}, max: {x: 2461, y: 2672}}),
            new GangZone({min: {x: 2451, y: 2556}, max: {x: 2551, y: 2656}}),
            new GangZone({min: {x: 2551, y: 2520}, max: {x: 2651, y: 2620}}),
            new GangZone({min: {x: 2585, y: 2473}, max: {x: 2685, y: 2573}}),
            new GangZone({min: {x: 2622, y: 2420}, max: {x: 2722, y: 2520}}),
            new GangZone({min: {x: 2649, y: 2357}, max: {x: 2749, y: 2457}}),
            new GangZone({min: {x: 2668, y: 1014}, max: {x: 2778, y: 2384}}),
            new GangZone({min: {x: 2654, y: 963}, max: {x: 2754, y: 1063}}),
            new GangZone({min: {x: 2617, y: 916}, max: {x: 2717, y: 1016}}),
            new GangZone({min: {x: 2574, y: 871}, max: {x: 2674, y: 971}}),
            new GangZone({min: {x: 2536, y: 830}, max: {x: 2636, y: 930}}),
            new GangZone({min: {x: 1270, y: 797}, max: {x: 2554, y: 897}}),
            new GangZone({min: {x: 1170, y: 797}, max: {x: 1270, y: 2320}}),
            new GangZone({min: {x: 2618, y: 1307}, max: {x: 2798, y: 1592}}),
            new GangZone({min: {x: 2756, y: 1381}, max: {x: 2856, y: 1629}}),
            new GangZone({min: {x: 2625, y: 2033}, max: {x: 2805, y: 2176}}),
            new GangZone({min: {x: 2650, y: 2122}, max: {x: 2782, y: 2222}}),
            new GangZone({min: {x: 1133, y: 1822}, max: {x: 1321, y: 1922}}),
            new GangZone({min: {x: 1114, y: 1722}, max: {x: 1318, y: 1822}}),
            new GangZone({min: {x: 1218, y: 1662}, max: {x: 1318, y: 1762}}),
            new GangZone({min: {x: 1256, y: 884}, max: {x: 1356, y: 1064}}),
            new GangZone({min: {x: 1284, y: 883}, max: {x: 1384, y: 1013}}),
            new GangZone({min: {x: 1202, y: 977}, max: {x: 1302, y: 1104}}),
            new GangZone({min: {x: 858, y: 523}, max: {x: 1337, y: 833}}),
            new GangZone({min: {x: 2188, y: 759}, max: {x: 2417, y: 859}}),
            new GangZone({min: {x: 2232, y: 841}, max: {x: 2456, y: 941}}),
            new GangZone({min: {x: 1522, y: 2445}, max: {x: 1822, y: 2545}}),
            new GangZone({min: {x: 1680, y: 2476}, max: {x: 1780, y: 2576}}),
            new GangZone({min: {x: 1630, y: 2454}, max: {x: 1730, y: 2554}}),
            new GangZone({min: {x: 1122, y: 2344}, max: {x: 1380, y: 2504}}),
            new GangZone({min: {x: 1157, y: 2244}, max: {x: 1306, y: 2344}}),
            new GangZone({min: {x: 1261, y: 2257}, max: {x: 1361, y: 2357}}),
            new GangZone({min: {x: 1206, y: 2192}, max: {x: 1306, y: 2292}}),
            new GangZone({min: {x: 2657, y: 2022}, max: {x: 2802, y: 2122}}),
            new GangZone({min: {x: 1746, y: 866.5}, max: {x: 1846, y: 2461}}),
            new GangZone({min: {x: 1705, y: 1708}, max: {x: 1873, y: 1808}}),
            new GangZone({min: {x: 1705, y: 1641}, max: {x: 1889, y: 1741}}),
            new GangZone({min: {x: 1846, y: 1708}, max: {x: 1903, y: 1770}}),
            new GangZone({min: {x: 1722, y: 2389}, max: {x: 1791, y: 2467}}),
            new GangZone({min: {x: 1710, y: 523}, max: {x: 1810, y: 623}}),
            new GangZone({min: {x: 859, y: 1205}, max: {x: 985, y: 1593}}),
            new GangZone({min: {x: 859, y: 828}, max: {x: 961, y: 1205}}),
            new GangZone({min: {x: 859, y: 2890}, max: {x: 3000, y: 3000}}),
            new GangZone({min: {x: 2786, y: 2675}, max: {x: 3000, y: 2890}}),
            new GangZone({min: {x: 2912, y: 517}, max: {x: 3000, y: 2675}}),
            new GangZone({min: {x: 2783, y: 515}, max: {x: 2924, y: 824}}),
            new GangZone({min: {x: 2733, y: 523}, max: {x: 2783, y: 623}}),
            new GangZone({min: {x: 859, y: 2454}, max: {x: 974, y: 2890}}),
            new GangZone({min: {x: 859, y: 2073}, max: {x: 897, y: 2454}}),
            new GangZone({min: {x: 859, y: 1593}, max: {x: 899, y: 1879}})
        )
    };

    public static init(): void {
        console.log("[CopChase] Сервис инициализирован.");
        this.initLobbyObject();
    }

    private static initLobbyObject(): void {
        for (const group of Object.values(this.gangZones)) group.create()
        this.lobbyObject = DynamicObject.create({
            x: this.lobbyObjectPos.x,
            y: this.lobbyObjectPos.y,
            z: this.lobbyObjectPos.z,
            model: this.lobbyObjectModel,
            rot: {x: 0, y: 0, z: 0},
            world: this.lobbyWorld,
        });

        setInterval(() => {
            if (this.players.size < this.minPlayers && this.active <= 0) {
                this.updateLobbyObjectText("Подбор...");
                this.pendingStartTime = 0;
                return;
            } else if (this.pendingStartTime == 0 && this.active <= 0) {
                this.pendingStartTime = 15
            }

            if (this.active > 0) {
                this.updateLobbyObjectText(`${this.formatTime(--this.active)}`);
            } else if (this.pendingStartTime > 1) {
                if (this.pendingStartTime == 10) {
                    this.suspect = [...this.players][Math.floor(Math.random() * this.players.size)];

                    for (const p of this.players) {
                        if (p.id === this.suspect.id) {
                            p.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы преступник. Игра начнётся через 10 секунд.`);
                        } else {
                            p.send(`${this.tagColor}[COPCHASE]: {ffffff}Преступник - ${this.suspect.name}.`);
                        }
                    }
                }

                this.updateLobbyObjectText(`${--this.pendingStartTime}`);
            } else {
                this.pendingStartTime = 0
                this.startGame()
            }
        }, 1000);
    }

    private static updateLobbyObjectText(text: string): void {
        if (!this.lobbyObject || this.lobbyObjectText == text) return;
        this.lobbyObject.removeMaterialText(0)
        this.lobbyObject.materialText({
            text,
            index: 0,
            align: 1,
            size: 140,
            color: 0xffff8200,
            backgroundColor: 0x00000000,
            fontSize: 56,
            fontFace: "Arial",
            bold: false,
        })
        this.lobbyObjectText = text;
    }

    static isInGame(player: Player): boolean {
        return this.players.has(player);
    }

    static isSuspect(player: Player): boolean {
        return this.players.has(player) && !!this.suspect && this.suspect.id === player.id
    }

    static giveGuns() {
        if (!this.suspect || this.weapons) return
        for (const p of this.players) {
            p.giveWeapon(Weapons.DEAGLE, 900)
            if (p.id !== this.suspect.id) {
                p.send(`${this.tagColor}[COPCHASE]: {ffffff}Разрешено применение оружия!`);
            }
        }
        this.weapons = true
    }

    static join(player: Player): void {
        if (this.players.has(player)) {
            player.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы уже участвуете в режиме.`);
            return;
        }

        this.players.add(player);
        player.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы присоединились к CopChase (${this.players.size} игроков).`);
        this.teleportToLobby(player);
    }

    static leave(player: Player): void {
        if (!this.players.has(player)) {
            player.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы не участвуете в CopChase.`);
            return;
        }

        this.players.delete(player);
        player.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы вышли из CopChase.`);
        this.teleportToLobby(player);
    }

    private static startGame(): void {
        if (this.active > 0 || !this.suspect) return;

        this.suspectInGangZoneAlive = 11
        this.active = 7 * 60;

        for (const p of this.players) {
            p.resetWeapons();

            if (p.id === this.suspect.id) {
                this.teleportToSuspectStart(p);
                p.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы преступник. Уезжайте!`);
            } else {
                this.teleportToCopStart(p);
                p.send(`${this.tagColor}[COPCHASE]: {ffffff}Поймайте ${this.suspect.name}!`);
            }

            for (const gangZone of this.gangZones[this.city])
                gangZone.show(p, 0xeff0000AA)
        }

        this.suspectTimer = setInterval(() => this.checkEscape(), 1000);
    }

    private static checkEscape(): void {
        if (!this.suspect || !this.active) return;

        if (this.suspectInGangZone()) {
            this.suspectInGangZoneAlive--
            this.suspect.gameText(`Danger zone! You will die in: ${this.suspectInGangZoneAlive} seconds`, 1000, 3);
        } else {
            this.suspectInGangZoneAlive = 11
        }

        if (!this.suspect.connected || this.suspect.health <= 0 || this.suspectInGangZoneAlive == 0) {
            this.broadcast(`${this.tagColor}[COPCHASE]: {ffffff}Преступник выбыл. Игра окончена.`);
            this.endGame(false);
            return;
        }

        const copsAlive = [...this.players].filter(
            (p) => p.id !== this.suspect!.id && p.connected && p.health > 0
        );

        if (copsAlive.length === 0) {
            this.broadcast(`${this.tagColor}[COPCHASE]: {ffffff}Все копы выбыли. Преступник победил!`);
            this.endGame(true);
            return
        }
    }

    private static suspectInGangZone(): boolean {
        if (!this.suspect) return false;
        const {x, y} = this.suspect.pos;

        const zones = this.gangZones[this.city];
        for (let i = 0; i < zones.length; i++) {
            const zone = zones[i];
            const opts = zone.idOrOptions;

            if (
                typeof opts === "object" &&
                "min" in opts && "max" in opts &&
                typeof opts.min.x === "number" && typeof opts.min.y === "number" &&
                typeof opts.max.x === "number" && typeof opts.max.y === "number"
            ) {
                const {min, max} = opts;
                if (x >= min.x && x <= max.x && y >= min.y && y <= max.y) return true;
            }
        }

        return false;
    }

    static catchSuspect(cop: Player): void {
        if (!this.active || !this.suspect) return;

        for (const p of this.players) {
            if (p.id === this.suspect!.id) {
                p.giveMoney(500);
                p.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы проиграли, но получили $500.`);
            } else {
                p.giveMoney(1000);
                p.send(`${this.tagColor}[COPCHASE]: {ffffff}Вы поймали преступника! +$1000.`);
            }
        }

        this.broadcast(`${this.tagColor}[COPCHASE]: {ffffff}Полицейский ${cop.name} поймал ${this.suspect.name}!`);
        this.endGame(false);
    }

    private static endGame(suspectWon: boolean): void {
        if (!this.suspect) return;

        clearInterval(this.suspectTimer!);

        for (const p of this.players) {
            if (p.id === this.suspect.id) {
                const reward = suspectWon ? 5000 : 500;
                p.giveMoney(reward);
                p.send(
                    suspectWon
                        ? `${this.tagColor}[COPCHASE]: {ffffff}Вы сбежали! +$5000.`
                        : `${this.tagColor}[COPCHASE]: {ffffff}Вы проиграли.`
                );
            } else {
                p.giveMoney(1000);
                p.send(
                    suspectWon
                        ? `${this.tagColor}[COPCHASE]: {ffffff}Преступник сбежал. +$1000 за участие.`
                        : `${this.tagColor}[COPCHASE]: {ffffff}Вы выиграли!`
                );
            }
        }

        this.broadcast(`${this.tagColor}[COPCHASE]: {ffffff}Игра завершена.`);

        for (const player of this.players) {
            this.teleportToLobby(player);
            // player.resetWeapons();
            this.weapons = false;
        }

        this.active = 0;
        this.suspect = null;
        this.vehicles.destroy()
        this.vehicles = new Group<Vehicle>

        for (const gangZone of this.gangZones[this.city])
            gangZone.hideForAll()
    }

    private static broadcast(msg: string): void {
        for (const p of this.players) {
            p.send(msg);
        }
    }

    private static teleportToLobby(player: Player): void {
        player.spawnInfo({
            rotation: 0,
            skin: 0,
            team: 0,
            weapons: [],
            x: this.randomInRange(-1357, -1350),
            y: this.randomInRange(-2, 5),
            z: 6,
        })
        player.world = this.lobbyWorld;
        player.spawn()
    }

    private static teleportToSuspectStart(player: Player): void {
        player.world = this.lobbyWorld;
        const veh = Vehicle.create({
            colors: [0, 0],
            model: 415,
            rotation: 0,
            x: -1400,
            y: 0,
            z: 6,
            world: this.lobbyWorld,
        })
        veh.params = {
            doors: false,
            engine: true,
            lights: true,
            alarm: false,
            bonnet: false,
            boot: false,
            objective: false
        }
        this.vehicles.push(veh)
        player.put(veh);
    }

    private static teleportToCopStart(player: Player): void {
        player.world = this.lobbyWorld;
        const veh = Vehicle.create({
            colors: [0, 0],
            model: 415,
            rotation: 0,
            x: -1390,
            y: 3,
            z: 6,
            world: this.lobbyWorld,
        })
        veh.params = {
            doors: false,
            engine: true,
            lights: true,
            alarm: false,
            bonnet: false,
            boot: false,
            objective: false
        }
        this.vehicles.push(veh)
        player.put(veh);
    }

    private static randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private static formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}