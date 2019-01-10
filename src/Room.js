const State = {
    LOBBY: "LOBBY",
    ROLE_SELECTION: "ROLE_SELECTION",
    PRE_GAME: "PRE_GAME",
    NIGHT_TRANSITION: "NIGHT_TRANSITION",
    NIGHT: "NIGHT",
    DAY_TRANSITION: "DAY_TRANSITION",
    DAY_CALLOUTS: "DAY_CALLOUTS",
    DISCUSSION: "DISCUSSION",
    TRIAL: "TRIAL",
    EXECUTION: "EXECUTION",
    GAME_OVER: "GAME_OVER"
};

const Role = {
    // Town idle
    VILLAGER: "VILLAGER",

    // Town protective
    HEALER: "HEALER",

    // Town informative
    SEER: "SEER",
    SPY: "SPY",
    INVESTIGATOR: "INVESTIGATOR",

    // Town killing
    VETERAN: "VETERAN",
    PRIEST: "PRIEST",

    // Werewolves
    WEREWOLF: "WEREWOLF",
    WOLF_SEER: "WOLF_SEER",

    // Witches
    WITCH: "WITCH",
    DEATH_WITCH: "DEATH_WITCH",
    CREEPY_GIRL: "CREEPY_GIRL",

    // Arsonist
    ARSONIST: "ARSONIST",

    // Neutral roles
    JESTER: "JESTER",
};

const Alignment = {
    GOOD: "GOOD",
    EVIL: "EVIL",
    CHAOS: "CHAOS",
    NEUTRAL: "NEUTRAL"
};

const Faction = {
    VILLAGE: "VILLAGE",
    WEREWOLVES: "WEREWOLVES",
    NEUTRAL: "NEUTRAL",
    WITCH: "WITCH",
    ARSONIST: "ARSONIST"
}

const Power = {
    NONE: 0,
    BASIC: 1,
    POWERFUL: 2,
    UNSTOPPABLE: 3
}

const dict = function(){
    var di = {};
    for (var i = 0; i < arguments.length; i++) {
        di[arguments[i][0]] = arguments[i][1];
    }
    return di;
};

const NightPlayOrder = [
    Role.JESTER,
    Role.VETERAN,
    Role.WITCH,
    Role.CREEPY_GIRL,
    Role.WEREWOLF,
    Role.HEALER,
    Role.SEER,
    Role.PRIEST,
    Role.ARSONIST,
    Role.INVESTIGATOR,
    Role.SPY,
    "SPOOKY_DOLL" // For passing the spooky doll on and on...
];

const NightCalculationOrder = [
    Role.VETERAN,
    Role.WITCH,
    Role.JESTER,
    Role.CREEPY_GIRL,
    Role.WEREWOLF,
    Role.DEATH_WITCH,
    Role.ARSONIST,
    Role.PRIEST,
    Role.HEALER,
    Role.SEER,
    Role.WOLF_SEER,
    Role.INVESTIGATOR,
    Role.SPY
];

const NightDetails = dict(
    [Role.WEREWOLF, {
        summon_message: "Werewolves, wake up. Pick a player to attack.",
        end_message: "Good night, werewolves.",
        timer: 30000,
        should_play: function(game) {
            return game.players.filter(x => x.faction == Faction.WEREWOLVES).length;
        }
    }],
    [Role.HEALER, {
        summon_message: "Healer, wake up. Pick a player to heal.",
        end_message: "Good night, healer.",
        timer: 10000
    }],
    [Role.SEER, {
        summon_message: "Fortune teller, wake up. Pick a player to check.",
        end_message: "Good night, fortune teller.",
        timer: 10000
    }],
    [Role.WITCH, {
        summon_message: "Witch, wake up. Pick a player to cast your spells on.",
        end_message: "Good night, witch.",
        timer: 20000,
        should_play: function(game) {
            return game.players.filter(x => x.role == Role.WITCH || x.role == Role.DEATH_WITCH).length > 0;
        }
    }],
    [Role.JESTER, {
        summon_message: "Jester, wake up. Pick a player to haunt.",
        end_message: "Good night, jester.",
        timer: 10000,
        should_play: function(game) {
            return game.players.filter(x => x.role == Role.JESTER && x.haunting).length;
        }
    }],
    [Role.VETERAN, {
        summon_message: "Veteran, wake up. Would you like to stay on alert?.",
        end_message: "Good night, veteran.",
        timer: 10000
    }],
    [Role.PRIEST, {
        summon_message: "Priest, wake up. Pick a player to kill.",
        end_message: "Good night, priest.",
        timer: 10000
    }],
    [Role.SPY, {
        summon_message: "Spy, wake up. Pick a player to follow.",
        end_message: "Good night, spy.",
        timer: 10000
    }],
    [Role.INVESTIGATOR, {
        summon_message: "Investigator, wake up. Pick a player to investigate.",
        end_message: "Good night, investigator.",
        timer: 10000
    }],
    [Role.ARSONIST, {
        summon_message: "Arsonist, wake up. Pick a player to douse or ignite all doused players.",
        end_message: "Good night, arsonist.",
        timer: 10000
    }],
    [Role.CREEPY_GIRL, {
        summon_message: "Creepy Girl, wake up. Give your doll to a player.",
        end_message: "Good night, creepy girl.",
        timer: 10000,
        should_play: function(game) {
            return game.players.filter(x => x.role == Role.CREEPY_GIRL).length && game.night == 1;
        }
    }],
    ["SPOOKY_DOLL", {
        summon_message: "Player with the spooky doll, wake up. Pass the doll on.",
        end_message: "Good night, spooky doll.",
        timer: 10000,
        should_play: function(game) {
            return game.players.filter(x => x.holds_doll).length && game.night > 1;
        }
    }]
);

const WolfSeerResults = dict(
    [Role.VILLAGER, "Your target is innocent and useless. They must be a villager!"],
    [Role.HEALER, "Your target heals people. They must be a healer!"],
    [Role.SEER, "Your target watches people's aura. They must ba a fortune teller!"],
    [Role.SPY, "Your target follows people at night. They must be a spy!"],
    [Role.INVESTIGATOR, "Your target has so much paperwork. They must be an investigator!"],
    [Role.VETERAN, "You found a gun at your target's house. They are a veteran!"],
    [Role.PRIEST, "Your target is worshiping God. They must be a priest!"],
    [Role.WEREWOLF, "You could literally know that without wasting your ability... Werewolf..."],
    [Role.WOLF_SEER, "It's like looking at a mirror. Your target is a wolf seer!"],
    [Role.WITCH, "Your target casts mystical spells. They must be a witch!"],
    [Role.ARSONIST, "Your target has fuel cans, they must be an arsonist!"],
    [Role.JESTER, "Your target just wants to be hung. They must be a jester!"],
    [Role.DEATH_WITCH, "Your target casts mystical spells. They must be a witch!"],
    [Role.CREEPY_GIRL, "Your target seems to hold a doll... She must be the creepy girl!"]
);

const randomRole = {
    "TOWN_INV": ["SEER", "SPY", "INVESTIGATOR"],
    "TOWN_RAND": ["VILLAGER", "HEALER", "SEER", "PRIEST", "VETERAN", "SPY", "INVESTIGATOR"],
    "TOWN_ATCK": ["VETERAN", "PRIEST"],
    "WOLF_RAND": ["WEREWOLF", "WOLF_SEER"],
    "RANDOM": Object.keys(Role).map(x => Role[x])
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function randomOf(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function max(arr, evaluator) {
    return arr.reduce((prev, current) => evaluator(prev) > evaluator(current) ? prev : current);
}

export class GameRoom {
    constructor(id, isTest = false) {
        if (isTest) {
            this.DEBUG = true;
        }

        this.clients = [];
        this.players = [];
        this.NightPlayOrder = [];
        
        this.roles = [Role.CREEPY_GIRL, Role.VILLAGER, Role.WEREWOLF];
        
        this.roomId = id;
    }

    onInit() {
        console.log("Room was initialized", this.roomId);
        this.reset();
    }

    onJoin(client) {
        console.log(client.id, "joined", this.roomId);
        if (this.state == State.LOBBY) this.speak(client.nickname + " has joined the town");
        
        this.syncClientList();
        this.syncGamestate();
        this.syncRolesList();
    }

    onLeave(client) {
        console.log(client.id, "left", this.roomId);
        if (this.state == State.LOBBY) this.speak(client.nickname + " has left the town");
        
        this.syncClientList();
        this.syncGamestate();
    }

    onDispose(client) {
        console.log("Disposed room", this.roomId);
    }

    setTimer(millis) {
        if (!millis)
            this.timer = null;
        else
            this.timer = new Date().getTime() + millis;
    }

    setState(newState, timer, timer_hidden, noUpdate) {
        this.state = newState;
        this.setTimer(timer);
        this.timer_shown = !timer_hidden;
        
        if (!noUpdate) {
            this.syncGamestate();
        }
    }

    timerDue() {
        return this.timer && new Date().getTime() > this.timer;
    }

    /*
    Called every 500ms and should update the game states
    */
    onLoop() {
        switch (this.state) {
            case State.LOBBY:
                // this.onLoop_LOBBY();
                break;
            case State.ROLE_SELECTION:
                this.onLoop_ROLESELECTION();
                break;
            case State.PRE_GAME:
                this.onLoop_PREGAME();
                break;
            case State.NIGHT_TRANSITION:
                this.onLoop_NIGHTTRANSITION();
                break;
            case State.NIGHT:
                this.onLoop_NIGHT();
                break;
            case State.DAY_TRANSITION:
                this.onLoop_DAYTRANSITION();
                break;
            case State.DAY_CALLOUTS:
                this.onLoop_DAYCALLOUTS();
                break;
            case State.DISCUSSION:
                this.onLoop_DISCUSSION();
                break;
            case State.TRIAL:
                this.onLoop_TRIAL();
                break;
            case State.EXECUTION:
                this.onLoop_EXECUTION();
                break;
            case State.GAME_OVER:
                this.onLoop_GAMEOVER();
                break;
        }
    }

    // Lobby state loop
    onLoop_LOBBY() {
        if (this.hostReady && this.roles.length >= this.clients.length) {
            // In order to start we verify that the roles are sufficient for the players
            this.startRoleSelection();
        }
    }

    onLoop_ROLESELECTION() {
        if (this.timerDue()) {
            this.enterPregame();
        }
    }

    onLoop_PREGAME() {
        if (this.timerDue()) {
            this.startNightTransition();
        }
    }

    onLoop_NIGHTTRANSITION() {
        if (this.timerDue()) {
            this.resetNight();
        }
    }

    onLoop_NIGHT() {
        var active = this.players.filter(x => x.active); // Getting cached active values
        
        if ((active.length == 0 || this.timerDue()) && this.minTime <= new Date().getTime()
            && !this.nightActionDone && this.nightActionStarted) {
            this.nightActionDone = true;
            

            this.setTimer(null);
            this.speak(NightDetails[this.NightPlayOrder[this.nightIndex]].end_message);
            
            setTimeout(() => {
                this.tryIncrementNightAction();
            }, 2000);            
        }
    }

    tryIncrementNightAction() {
        console.log("No active players left, incrementing nightIndex");
        this.endNightAction();
        
        if (this.nightIndex < this.NightPlayOrder.length) {
            console.log("Continuing to play. Current night order", this.NightPlayOrder[this.nightIndex]);
            this.startNightAction();
        }
        else {
            this.endNight();
        }
    }

    onLoop_DAYTRANSITION() {
        if (this.timerDue()) {
            this.setState(State.DAY_CALLOUTS, 1);
        }
    }

    onLoop_DAYCALLOUTS() {
        if (this.timerDue()) {
            this.nextDayCallout();
        }
    }

    onLoop_DISCUSSION() {
        if (this.timerDue()) {
            this.startNightTransition();
        }
    }

    onLoop_TRIAL() {
        if (this.timerDue()) {
            this.speak("The town could not decide whether to lych " + this.player_on_stand.name);
            this.trialInnocent();
        }
    }

    onLoop_EXECUTION() {
        if (this.timerDue()) {
            this.player_on_stand.execute()
            this.player_on_stand = null;


            if (!this.calculateVictory()) {
                this.startNightTransition();
            }
        }
    }

    onLoop_GAMEOVER() {
        if (this.timerDue()) {
            this.reset();
            this.setState(State.LOBBY);
        }
    }

    endNight() {
        this.custom_callouts = [];
        this.calculateNightActions();
        this.calculateWerewolfKill();

        this.callouts = this.calculateNightDeaths() || ["No one was killed tonight"];
        for (var c of this.custom_callouts) this.callouts.push(c);
        
        this.calculatePromotions();
        this.calculateConversions();

        this.setDayTransition();
    }

    setDayTransition() {

        this.player_on_stand = null;

        for (var p of this.players) {
            p.resetDay();
        }

        this.setState(State.DAY_TRANSITION, 5000, true);
        //this.speak("Koo Koo Ree Koo, I am a chicken. Good morning village");

        this.broadcaseNightMessages();
    }

    broadcaseNightMessages() {
        for (var player of this.players.filter(x => !x.dead_sync)) {
            var c = this.getClient(player.id);
            if (c) c.emit("open_messages", player.messages);
        }
    }

    nextDayCallout() {
        var callout = this.callouts.shift();
        if (!callout) {
            if (!this.calculateVictory()) {
                this.setState(State.DISCUSSION, 60 * 1000 * 3.5);
            }
        }
        else if (callout.constructor.name == "String") {
            this.speak(callout);
            this.message = callout;
            this.syncGamestate();
            this.setTimer(5000);
        }
        else if (callout.constructor.name == "Array") {
            if (callout[0] == "deadsync") {
                callout[1].dead_sync = callout[1].dead;
            }
            setTimeout(this.nextDayCallout.bind(this), 1);
        }
    }

    getRole(roleOpts) {
        if (roleOpts.constructor.name == "String") {
            if (randomRole[roleOpts]) {
                return randomOf(randomRole[roleOpts]);
            }
            else return roleOpts;
        }
        else return randomOf(roleOpts);
    }

    startRoleSelection() {
        this.calculateNightOrder();
        this.speak("Players, prepare for your roles!");

        // Shuffling the roles deck (cards deck)
        var deck = this.roles.slice(0, this.clients.length);
        for (var i = 0; i < 100; i++) {
            shuffle(deck);
        }

        // Initializing our playerl list (Note, NOT the client list. It's different)
        this.players.length = 0;
        for (var i in this.clients) {
            var { id, image, nickname, color } = this.clients[i];
            var role = this.getRole(deck[i]);

            this.players.push(createPlayer(id, nickname, image, color, role));
        }

        // Setting the new state
        this.setState(State.ROLE_SELECTION, 10000);
    }

    calculateNightOrder() {
        var r = [Role.WEREWOLF, Role.WITCH, "SPOOKY_DOLL"];

        console.log(this.roles);
        for (var role of this.roles) {
            if (role.constructor.name == "String") {

                if (randomRole[role]) {
                    for (var rrole of randomRole[role]) {
                        if (!~r.indexOf(rrole)) {
                            r.push(rrole);
                        }
                    }
                }

                else if (!~r.indexOf(role)) {
                    r.push(role);
                }
            }
            else {
                for (var rrole of role) {
                    if (!~r.indexOf(rrole)) {
                        r.push(rrole);
                    }
                }
            }
        }

        this.NightPlayOrder.length = 0;
        for (var play of NightPlayOrder) {
            if (~r.indexOf(play)) {
                this.NightPlayOrder.push(play);
            }
        }
        if (this.NightPlayOrder.length == 0) {
            this.NightPlayOrder.push(Role.WEREWOLF);
        }
    }

    startNightTransition() {
        this.setState(State.NIGHT_TRANSITION, 4000);
        this.night++;
        // this.speak("Woof woof, I am a scary werewolf. The night begins now");
    }

    enterPregame() {
        this.setState(State.PRE_GAME, 5000, true);
        this.speak("Get ready to play...");
    }

    getActivePlayers() {
        console.log("Looking for active players");
        var ps = [];
        for (var p of this.players) {
            if (p.__isActive(this)) {
                p.active = true;
                ps.push(p);
            }
            else {
                p.active = false;
            }
        }
        return ps;
    }

    calculatePromotions() {
        var player_list_changed = false;

        // Promoting a werewolf team member to being a werewolf
        if (this.players.filter(x => !x.dead && x.role == Role.WEREWOLF).length == 0) {
            var nonwws = this.players.filter(x => !x.dead && x.faction == Faction.WEREWOLVES);
            if (nonwws.length > 0) {
                shuffle(nonwws);
                nonwws[0].setRole(Role.WEREWOLF);
                nonwws[0].sendMessage("All werewolves have died so you have become a werewolf!");

                player_list_changed = true;
            }
        }

        return player_list_changed;
    }

    calculateConversions() {
        for (var pi in this.players) {
            if (this.players[pi].convert) {
                this.players[pi] = convertPlayer(this.players[pi], this.players[pi].convert);
            }
        }
    }

    calculateWerewolfKill() {

        var witched = false;

        for (var ww of this.players.filter(x => x.role == Role.WEREWOLF && x.target && x.witched)) {
            if (ww.target != target) {
                ww.werewolfKill(ww.target);
                witched = true;
            }
        }

        if (witched) return; // If a werewolf got witched, they will attack INSTEAD the witch target
                             // instead of the voting target

        var wwVotes = this.players.filter(x => x.role == Role.WEREWOLF && x.target && !x.witched).map(x => x.target);
        var votes = [...new Set(wwVotes)].map(y => [y, wwVotes.filter(n => n == y).length]); // Counting the votes
        var targets = [];
        for (var vote of votes) {
            if (targets.length == 0 || targets[0][1] == vote[1]) {
                targets.push(vote);
            }
            else if (targets[0][1] < vote[1]) {
                targets.length = 0;
                targets.push(vote);
            }
        }

        var target = null;
        
        if (targets.length != 0) {
            target = randomOf(targets)[0];
            var attacker = randomOf(this.players.filter(x => x.role == Role.WEREWOLF && x.target == target));
            attacker.werewolfKill(target);
        }        
    }

    calculateNightActions() {
        console.log("Calculating night actions");
        for (var role of NightCalculationOrder) {
            console.log("Order:", role);
            for (var player of this.players.filter(x => x.role == role)) {
                if (player.canPerformRole(this)) {
                    player.performRole(this);
                }
            }
        }

        for (var player of this.players) {
            if (player.doll_giveto) player.giveDoll(this); // Giving the doll away
        }
    }

    calculateNightDeaths() {
        var day_callouts = [];
        for (var player of this.players.filter(x => !x.dead)) {
            var data = player.calculateKill(this);
            if (data) {
                day_callouts.push(...data);
            }
        }

        var killsTonight = this.players.filter(x => x.dead && !x.dead_sync);
        console.log("This night kills:", killsTonight);
        if (killsTonight.length > 0) {
            this.nights_no_kill = 0;
        }
        else {
            this.nights_no_kill++;
        }

        console.log("Nights with no killing", this.nights_no_kill);

        return day_callouts;
    }

    syncClientList() {
        var clients = this.clients.map(x => {
            return {
                name: x.nickname,
                id: x.id,
                image: x.image,
                color: x.color
            }
        });

        for (var client of this.clients) {
            client.emit("state", { clients });
        }
    }

    syncRolesList() {
        var gameState = {
            roles: this.roles
        };

        for (var client of this.clients) {
            client.emit("state", gameState);
        }
    }

    syncGamestate() {
        var gameState = {
            phase: this.state,
            players: this.players.map(x => x.objectify(this)),
            timer: this.timer_shown ? this.timer : null,
            message: this.message || null,
            player_on_stand: this.player_on_stand ? this.player_on_stand.objectify(this) : null,
            winning_faction: this.winning_faction && this.winning_faction.constructor.name == "String" ? this.winning_faction : "DRAW",
            night_index: this.NightPlayOrder[this.nightIndex]
        };

        for (var client of this.clients) {
            client.emit("state", gameState);
        }
    }

    speak(message) {
        if (!this.DEBUG && this.clients.length > 0)
            this.clients[0].emit("speak", message);
    }

    // Initializes the room as if the lobby phase started right now
    reset() {
        this.hostReady = false;

        this.state = State.LOBBY;
        this.timer = null;
        this.timer_shown = false;

        this.night = 0;

        this.minTime = 0;

        this.player_on_stand = null;

        this.winning_faction = null;

        this.nights_no_kill = 0;

        this.players.length = 0;
    }

    // Sets the game up for a new 
    resetNight() {
        this.nightIndex = 0;
        this.nightActionStarted = false;
        this.custom_callouts = [];
        this.setState(State.NIGHT, null, null, true);

        for (var p of this.players) {
            p.resetNight();
        }

        this.startNightAction();
    }

    startNightAction() {
        console.log("Starting night action", this.NightPlayOrder, this.NightPlayOrder[this.nightIndex]);
        var filter = NightDetails[this.NightPlayOrder[this.nightIndex]].should_play;
        if (filter && !filter(this)) {
            this.tryIncrementNightAction(); // recursive but it's ok by me
            return;
        }

        var active = this.getActivePlayers();
        this.nightActionDone = false;
        this.nightActionStarted = true;

        this.minTime = new Date().getTime() + Math.random() * 9000;
        this.setTimer(NightDetails[this.NightPlayOrder[this.nightIndex]].timer);

        this.syncGamestate();
        this.speak(
            NightDetails[this.NightPlayOrder[this.nightIndex]].summon_message);
    }

    endNightAction() {
        this.nightActionStarted = false;
        this.nightIndex++;
    }

    clearDoll() {
        for (var p of this.players) {
            p.holds_doll = false;
        }
    }

    __msg__add_role(client, data) {
        if (Role[data] || randomRole[data]) {
            this.roles.push(data);
            this.syncRolesList();
        }
    }

    __msg__remove_role(client, data) {
        if (data < this.roles.length) {
            this.roles.splice(data, 1);
            this.syncRolesList();
        }
    }

    __msg__set_preset(client, data) {
        this.roles = data;
        this.syncRolesList();
    }

    __msg__start_game(client, data) {
        console.log("Received START_GAME");
        if (this.state != State.LOBBY) return; // Can only start game while in lobby
        if (client.id != this.clients[0].id) return; // Only the host can start the game
        if (this.roles.length < this.clients.length) return; // Not enough role cards to start?

        this.startRoleSelection();
    }

    __msg__kick(client, data) {
        if (this.state != State.LOBBY) return; // Can only kick while in lobby
        if (client.id != this.clients[0].id) return; // Only the host can kick players

        var kicked = this.getClient(data);
        if (kicked) {
            kicked.emit("kick");
        }
    }

    __msg__night_action(client, data) {
        console.log("Night action:", data);
        var p = this.getPlayer(client.id);
        if (p) {
            if (this.NightPlayOrder[this.nightIndex] == "SPOOKY_DOLL") {
                p.setDollGive(data, this);
            }
            else {
                p.setTarget(data, this);
            }
        }

        this.getActivePlayers();
        this.syncGamestate();
    }

    __msg__set_vote(client, data) {

        if (this.state != State.DISCUSSION) return;

        var p = this.getPlayer(client.id);
        var t = this.getPlayer(data);

        if (p.dead || t.dead) return;
        
        if (p.id == t.id || (p.vote && p.vote.id == t.id)) {
            p.vote = null;
        }
        else {
            p.vote = t;
        }

        if (this.players.filter(x => !x.dead && x.vote == t).length > this.players.filter(x => !x.dead).length / 2) {
            this.setTrial(t);
        }

        this.syncGamestate();
    }

    __msg__trial_innocent(client) {
        if (this.state != State.TRIAL) return;  // Can only take this action in the TRIAL state
        if (client.id != this.clients[0].id) return; // Only host can execute/free accusees

        this.speak("The town has decided to set " + this.player_on_stand.name + " free.");

        this.trialInnocent();
    }

    __msg__trial_guilty(client) {
        if (this.state != State.TRIAL) return;  // Can only take this action in the TRIAL state
        if (client.id != this.clients[0].id) return; // Only host can execute/free accusees

        this.speak("The town has decided to execute " + this.player_on_stand.name + ". May god have mercy on your soul");

        this.trialGuilty();
    }

    __msg__skip_day(client) {
        if (this.state != State.DISCUSSION) return;  // Can only take this action in the DISCUSSION state
        if (client.id != this.clients[0].id) return; // Only host can skip day

        this.startNightTransition();
    }

    setTrial(player) {
        console.log(player.name, "is now on trial");
        
        this.discussion_timer = this.timer - new Date().getTime(); // Preserving the discussion timer
        
        this.player_on_stand = player;
        this.message = player.name + ", you are on trial for conspiracy against the town. What say you?"
        
        this.speak("The town has decided to put " + this.player_on_stand.name + " on trial.");
        
        this.setState(State.TRIAL, 60 * 1000);
    }

    trialInnocent() {
        for (var p of this.players) {
            p.resetDay();
        }

        this.setState(State.DISCUSSION, this.discussion_timer);
    }

    trialGuilty() {
        this.setState(State.EXECUTION, 6000);
    }

    getPlayer(id) {
        var p = this.players.filter(x => x.id == id);
        if (p.length == 0) return null;
        return p[0];
    }

    getClient(id) {
        var c = this.clients.filter(x => x.id == id);
        if (c.length == 0) return null;
        return c[0];
    }

    /*
    Returns the winning faction, or null if the game continues.
    Return values:
        null
        "DRAW" (by wipeout, draws between two factions are represented in an array)
        "VILLAGE"
        "WEREWOLVES"
        "NEUTRAL"
    */
    getWinningFaction() {
        var alive = this.players.filter(x => !x.dead);
        var village = alive.filter(x => x.faction == Faction.VILLAGE);
        var priests = village.filter(x => x.role == Role.PRIEST);
        var werewolves = alive.filter(x => x.faction == Faction.WEREWOLVES);
        var neutral = alive.filter(x => x.faction == Faction.NEUTRAL);
        var witches = alive.filter(x => x.role == Role.WITCH);
        var witch_team = alive.filter(x => x.faction == Faction.WITCH);
        var arsonists = alive.filter(x => x.faction == Faction.ARSONIST);

        var healers = alive.filter(x => x.role == Role.HEALER);

        if (alive.length == 0) {
            return "DRAW";
        }

        if (neutral.length == alive.length) {
            return Faction.NEUTRAL;
        }

        if (village.length + neutral.length == alive.length) {
            return Faction.VILLAGE;
        }

        if (werewolves.length + neutral.length == alive.length) {
            return Faction.WEREWOLVES
        }

        if (witch_team.length + neutral.length == alive.length) {
            return Faction.WITCH;
        }

        if (arsonists.length + neutral.length == alive.length) {
            return Faction.ARSONIST;
        }

        // Uncalculated stalemate prevention
        // If there are three nights with no kills, game will stale and a draw will be announced
        if (this.night >= 3 && this.nights_no_kill >= 3) {
            return "NOKILL";
        }

        // Witch vs town delayed victory
        // If witch is against 1 town (with no WWs), if the town does not have
        // killing roles such as priests, witch should immediately lose
        if (village.length + witches.length + priests.length == 3) {
            return Faction.VILLAGE;
        }

        // witch vs ww delayed victory
        // In case of 1 witch + 1 ww, no-one can lynch the other.
        // In the following night, the witch witches the ww to kill themselves and wins.
        if (witches.length == 1 && werewolves.length == 1) {
            return Faction.WITCH;
        }

        // WW vs healer stalemate
        // If 1 ww + 1 healer are alive, draw should be immediately called
        if (healers.length == 1 && werewolves.length == 1) {
            return [Faction.VILLAGE, Faction.WEREWOLVES];
        }

        return null;
    }

    calculateVictory() {
        var f = this.getWinningFaction();
        
        if (f) {
            for (var p of this.players) {
                p.won = p.isVictorious(f);
            }
            this.winning_faction = f;

            this.setState(State.GAME_OVER, 16000);
            return true;
        }

        return false;
    }
}

export class RoomManager {
    constructor() {
        this.rooms = [];
        setInterval(this.checkOnRooms.bind(this), 300);
    }

    checkOnRooms() {
        for (var r of this.rooms) {
            r.onLoop.bind(r)();
        }
    }

    generateId() {
        return Math.round(Math.random() * 9000 + 1000).toString();
    }

    generateValidatedId() {
        var id = this.generateId();
        while (this.rooms.filter(x => x.id == id).length > 0) {
            id = this.generateId();
        }
        return id;
    }

    dump() {
        // console.log(this.rooms);
    }

    getRoom(roomId) {
        var r = this.rooms.filter(x => x.roomId == roomId);
        if (!r.length) {
            return null;
        }

        return r[0];
    }

    removeRoom(roomId) {
        this.rooms.splice(this.rooms.findIndex(r => r.roomId == roomId), 1);
    }

    createRoom() {
        var r = new GameRoom(this.generateValidatedId());
        this.rooms.push(r);

        r.onInit();
        this.dump();
        return r.roomId;
    }

    joinRoom(roomId, socket) {
        var room = this.getRoom(roomId);
        if (room.clients.filter(x => x.id == socket.id).length > 0) {
            return;
        }

        room.clients.push(socket);
        socket.room = room;
        room.onJoin(socket);
        this.dump();
    }

    leaveRoom(socket) {
        var room = socket.room;
        if (room.clients.filter(x => x.id == socket.id).length == 0) {
            return;
        }

        room.clients.splice(room.clients.findIndex(x => x.id == socket.id), 1);
        socket.roomId = null;

        room.onLeave(socket);

        this.tryDispose(room);
        this.dump();
    }

    tryDispose(room) {
        if (room.clients.length == 0) {
            room.onDispose();
            this.rooms.splice(this.rooms.findIndex(x => x.roomId == room.roomId), 1);            
        }
    }
}

class Player {
    constructor(id, name, image, color) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.color = color;

        this.dead = false;
        this.dead_sync = false;

        this.active = false;

        this.attackers = [];
        this.healers = [];
        this.visitors = [];

        this.messages = [];
        this.vote = null;

        this.won = false;
        
        this.convert = null;
    }

    init() { }
    performRole() { }

    resetNight() {
        this.target = null;

        this.attackers.length = 0;
        this.healers.length = 0;
        this.visitors.length = 0;
        this.messages.length = 0;

        this.witched = false; // For witch action

        this.convert = null; // For changing player's roles.
        this.doll_giveto = null; // For passing on the doll
    }

    resetDay() {
        this.vote = null;
    }

    setRole(role) {
        this.convert = role;
    }

    isActive(game) {
        console.log("Checking if", this.name, "is active");
        console.log("Current order", game.NightPlayOrder[game.nightIndex], "my order", this.role);
        console.log("am i dead", this.dead);
        console.log("Did i already play", this.target);
        return game.NightPlayOrder[game.nightIndex] == this.role && !this.dead && this.target === null;
    }

    isActive__doll(game) {
        return game.NightPlayOrder[game.nightIndex] == "SPOOKY_DOLL" && !this.dead && this.holds_doll && this.doll_giveto == null;
    }

    __isActive(game) {
        return this.isActive(game) || this.isActive__doll(game);
    }

    setDollGive(input, game) {
        console.log("Setting doll give");
        if (input === false) {
            this.doll_giveto = false;
            return;
        }
        var p = game.getPlayer(input);
        if (p != null && !p.dead) {
            this.doll_giveto = p;
        }
    }

    giveDoll() {
        if (this.doll_giveto) {
            this.doll_giveto.holds_doll = true;
            this.holds_doll = false;
            this.doll_giveto.sendMessage("You have been given the spooky doll");
        }
    }

    setTarget(input, game) {
        if (input === false) {
            this.target = false;
            return;
        }
        var p = game.getPlayer(input);
        if (p != null && !p.dead) {
            this.target = p;
        }
    }

    canPerformRole(game) {
        return !this.dead && this.target;
    }

    calculateKill(game) {
        var attack = this.attackers.length ? max(this.attackers, x => x[1]) : null;
        var defense = this.healers.length ? max(this.healers, x => x[1]) : null;

        if (attack) {
            if (!defense || attack[1] > defense[1]) {
                // Killed
                this.kill(game);
                this.sendMessage("You have died!");

                var callouts = ["Tonight, we found " + this.name + ", dead in their home."];
                for (var a in this.attackers) {
                    callouts.push((a == 0 ? "They were apparently " : "They were also ") + 
                                    (this.attackers[a][2] || "attacked."));
                }
                callouts.push(["deadsync", this]);
                callouts.push("Rest in peace, " + this.name);
                return callouts;
            }
            else {
                this.sendMessage("Someone attacked you but you were saved!")
                callouts.push(this.name + " was apparently attacked tonight, but they survived");
            }
        }
    }

    getVisited(visitor) {
        this.visitors.push(visitor);
        return true; // Regular players don't do much when visited. True means that the visit is possible
    }

    kill(game) {
        this.dead = true;

        // Handling Creepy Girl doll death
        if (this.holds_doll) {
            game.clearDoll();
            var creepyGirl = game.players.filter(x => x.role == Role.CREEPY_GIRL && !x.dead);
            if (creepyGirl.length) {
                for (var girl of creepyGirl) {
                    girl.setRole(Role.DEATH_WITCH);
                    girl.sendMessage("Your doll has been taken to the grave, and you are now a Death Witch!");
                }
                game.custom_callouts.push("The spooky doll has vanished.");
            }
        }
    }

    execute() {
        this.dead = true;
        this.dead_sync = true;
    }

    sendMessage(text) {
        this.messages.push(text);
    }

    isVictorious(winning_faction) {
        return (winning_faction == this.faction || ~winning_faction.indexOf(this.faction));
    }

    objectify(game) {
        // console.log("Objectifying player , target", this.target && this.target.id);
        return {
            name: this.name,
            id: this.id,
            image: this.image,
            color: this.color,
            dead: this.dead_sync,
            active: this.active,
            role: this.role,
            messages: this.messages,
            vote: this.vote ? this.vote.id : null,
            won: this.won || false,
            target: this.target ? this.target.id : null
        }
    }
}

class Villager extends Player {

    init() {
        this.role = Role.VILLAGER;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = true;
    }

    isActive() {
        return false;
    }
}

class Werewolf extends Player {
    init() {
        this.role = Role.WEREWOLF;
        this.alignment = Alignment.EVIL;
        this.seer_result = Alignment.EVIL;
        this.faction = Faction.WEREWOLVES;

        this.witchImmune = false;
    }

    isActive(game) {

        if (game.NightPlayOrder[game.nightIndex] != "WEREWOLF") return false;
        if (this.dead) return false;

        var wolves = game.players.filter(x => x.role == this.role && x.target != this.target && !x.dead);
        if (wolves.length == 0 && this.target != null) return false;

        return true;
    }

    werewolfKill(target) {
        if (this.canPerformRole()) {
            if (!target.getVisited(this)) return;
            target.attackers.push([this, Power.BASIC, "attacked by a werewolf"]);
        }
    }
}

class WolfSeer extends Player {
    init() {
        this.role = Role.WOLF_SEER;
        this.faction = Faction.WEREWOLVES;
        this.alignment = Alignment.EVIL;
        this.seer_result = Alignment.EVIL;

        this.witchImmune = false;
    }

    isActive(game) {
        if (game.NightPlayOrder[game.nightIndex] != "WEREWOLF") return false;
        if (this.dead) return false;
        if (this.target != null) return false;

        return true;
    }

    performRole() {
        if (!this.canPerformRole()) return;
        if (!this.target.getVisited(this)) return;

        this.sendMessage(WolfSeerResults[this.target.role] || "Your target's role could not be determined");
    }
}

class Jester extends Player {
    init() {
        this.role = Role.JESTER;
        this.alignment = Alignment.NEUTRAL;
        this.seer_result = Alignment.EVIL;
        this.faction = Faction.NEUTRAL;

        this.jester_win = false;
        this.haunting = false;
    }

    isActive(game) {
        return game.NightPlayOrder[game.nightIndex] == this.role && this.target === null && this.haunting;
    }

    canPerformRole() {
        return this.haunting;
    }

    performRole() {
        console.log("Jester attacking");

        this.haunting = false;
        if (!this.target) return;

        this.target.getVisited(this); // The jester can attack no matter what. We don't take the return value

        this.target.attackers.push([this, Power.UNSTOPPABLE, "haunted by the jester"]);
        this.target.sendMessage("In your dream... You saw a Jester! Then a bright white light...")
    }

    execute() {
        super.execute();
        console.log("Executed a jester");
        this.jester_win = true;
        this.haunting = true;
    }
}

class Healer extends Player {
    init() {
        this.role = Role.HEALER;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = false;
    }

    performRole() {
        if (!this.canPerformRole()) return;

        if (!this.target.getVisited(this)) return;

        console.log(this.name, "healing", this.target.name);
        this.target.healers.push([this, Power.BASIC]);
    }
}

class Priest extends Player {
    init() {
        this.role = Role.PRIEST;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = false;

        this.abilities = 1;
    }

    performRole() {
        if (!this.canPerformRole()) return;

        if (this.abilities > 0) {
            this.abilities--;
        }
        else {
            return;
        }

        if (!this.target.getVisited(this)) return;

        this.target.attackers.push([this, Power.BASIC, "attacked by a priest"]);
        this.target.sendMessage("You were attacked by a priest!");
        
        if (this.target.alignment == Alignment.GOOD) {
            this.attackers.push([null, Power.BASIC, "killed by a divine power"]);
            this.target.sendMessage("You will pay for your sins with your life!");
        }
    }
}

class Veteran extends Player {
    init() {
        this.role = Role.VETERAN;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.EVIL; // Veteran is seen as evil by the seer
        this.faction = Faction.VILLAGE;

        this.witchImmune = true;

        this.alerts_left = 3;
    }

    resetNight(game) {
        super.resetNight(game);

        this.alert = false;
    }

    setTarget(target) {
        console.log("Setting veteran target", target);
        if (target) {
            if (this.alerts_left) {
                this.target = true;
            }
        }
        else {
            this.target = false;
        }
    }

    performRole() {
        console.log("The veteran is now calculating. Am I on alert?", this.target, this.alerts_left);
        if (this.target && this.alerts_left > 0) {
            this.alert = true;
            this.alerts_left--;
        }
    }

    getVisited(visitor) {
        super.getVisited(visitor);

        console.log("A veteran was visited. Alert?", this.alert);
        if (this.alert) {
            visitor.attackers.push([this, Power.POWERFUL, "shot by a veteran"]);
            visitor.sendMessage("You were shot by the veteran you visited!");
            this.sendMessage("You shot someone who visited you");
            return false;
        }

        return true;
    }
}

class Seer extends Player {
    init() {
        this.role = Role.SEER;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = false;
    }

    resetNight() {
        super.resetNight();
        this.seen_player = null;
    }
    
    // TODO: Inform the players that the Seer is also witch immune!!!!!!!

    setTarget(input, game) {
        if (input === true) {
            this.target = this.seen_player;
        }
        else {
            var c = game.getClient(this.id);
            var p = game.getPlayer(input);
            this.seen_player = p;
            if (c) {
                c.emit("seer_result", {seer_result: p ? game.getPlayer(input).seer_result : "GOOD"});
            }
        }
    }

    performRole() {
        this.target.getVisited(this); // Action was already done. We just get the counter attacks from our target here
    }
}

class Arsonist extends Player {
    init() {
        this.role = Role.ARSONIST;
        this.alignment = Alignment.CHAOS;
        this.seer_result = Alignment.EVIL;
        this.faction = Faction.ARSONIST;

        this.witchImmune = true;
    }

    setTarget(input, game) {
        var p = game.getPlayer(input);
        if (p) {
            this.target = p;
        }
        else {
            this.target = true;
        }
    }

    performRole(game) {

        if (!this.canPerformRole()) return;

        if (this.target == true) {
            // Igniting
            for (var p of game.players.filter(x => x.doused)) {
                p.attackers.push([this, Power.POWERFUL, "incinerated by an arsonist"]);
                this.sendMessage("You burned someone");
            }
        }
        else if (this.target == this) {
            this.doused = false;
        }
        else if (this.target) {
            if (!this.target.getVisited(this)) return;

            this.target.doused = true;
        }
    }
}

class Spy extends Player {
    init() {
        this.role = Role.SPY;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = false;
    }

    performRole() {
        if (!this.canPerformRole()) return;
        if (!this.target.getVisited(this)) return;
        
        for (var visitor of this.target.visitors) {
            this.sendMessage(visitor.name + " has visited your target");
        }
    }
}

class Investigator extends Player {
    init() {
        this.role = Role.INVESTIGATOR;
        this.alignment = Alignment.GOOD;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.VILLAGE;

        this.witchImmune = false;
    }

    performRole() {
        if (!this.canPerformRole()) return;
        if (!this.target.getVisited(this)) return;

        switch (this.target.role) {
            case Role.VILLAGER:
            case Role.ARSONIST:
            case Role.VETERAN:
                this.sendMessage("Your target could be a Villager, Arsonist or Veteran");
                break;
            case Role.INVESTIGATOR:
            case Role.WEREWOLF:
            case Role.PRIEST:
                this.sendMessage("Your target could be an Investigator, Werewolf or Priest");
                break;
            case Role.SEER:
            case Role.SPY:
            case Role.WITCH:
                this.sendMessage("Your target could be a Fortune Teller, Spy or Witch");
                break;
            case Role.JESTER:
            case Role.WOLF_SEER:
            case Role.HEALER:
                this.sendMessage("Your target could be a Jester, Wolf Seer or Healer");
                break;
            default:
                this.sendMessage("Your target's role could not be determined");
                break;
        }
    }
}

class Witch extends Player {
    init() {
        this.role = Role.WITCH;
        this.alignment = Alignment.CHAOS;
        this.seer_result = Alignment.GOOD;
        this.faction = Faction.WITCH;

        this.witchImmune = true;

        this.setTarget = this.setTarget.bind(this);
    }

    isVictorious(winning_faction) {
        return (winning_faction == this.faction || ~winning_faction.indexOf(this.faction)) && !this.dead;
        // Witches have to be alive to win
    }

    resetNight() {
        super.resetNight();

        this.target = [];
    }

    isActive(game) {
        // console.log("Checking if a witch is active");
        // console.log("Current order", game.NightPlayOrder[game.nightIndex], "my order", this.role);
        // console.log("am i dead", this.dead);
        // console.log("Did i already play", this.target);
        return game.NightPlayOrder[game.nightIndex] == this.role && !this.dead && this.target !== false && this.target.length < 2;
    }

    setTarget(input, game) {
        if (input === false) {
            this.target = false;
            return;
        }
        var p = game.getPlayer(input);
        if (p != null && !p.dead) {
            this.target.push(p);
        }
    }

    canPerformRole(game) {
        return !this.dead && this.target && this.target.length == 2;
    }

    performRole() {

        if (!this.canPerformRole()) return;

        if (!this.target[0].getVisited(this)) {
            this.target[0].sendMessage("A witch has tried to control you but you attacked her instead!");
            this.sendMessage("It seems like your target is immune to your spells!");
            return;
        }

        if (!this.target[0].witchImmune) {
            this.target[0].sendMessage("You feel a mystical power dominating you... You were witched!");
            this.sendMessage("You witched your target.")
            this.target[0].target = this.target[1];
            this.target[0].witched = true;
        }
    }
}

class DeathWitch extends Player {
    init() {
        this.role = Role.DEATH_WITCH;
        this.alignment = Alignment.CHAOS;
        this.seer_result = Alignment.EVIL;
        this.faction = Faction.WITCH;

        this.witchImmune = true;
    }

    isActive(game) {
        return !this.dead && game.NightPlayOrder[game.nightIndex] == Role.WITCH && this.target == null;
    }

    isVictorious(winning_faction) {
        return (winning_faction == this.faction || ~winning_faction.indexOf(this.faction)) && !this.dead;
        // Witches have to be alive to win
    }

    performRole() {
        if (!this.canPerformRole()) return;

        if (!this.target.getVisited(this)) return;

        this.target.attackers.push([this, Power.POWERFUL, "cursed by a witch"]);
        this.sendMessage("You have cursed your target");
    }
}

class CreepyGirl extends Player {
    init() {
        this.role = Role.CREEPY_GIRL;
        this.alignment = Alignment.CHAOS;
        this.seer_result = Alignment.GOOD;

        this.faction = Faction.WITCH;

        this.witchImmune = true;

        this.holds_doll = true; // The creepy girl starts with the doll N0
    }

    performRole() {
        if (!this.canPerformRole()) return;

        if (!this.target.getVisited(this)) return;

        this.holds_doll = false;
        this.target.holds_doll = true;
        this.target.sendMessage("You have been given the spooky doll by the creepy girl");
    }

    kill(game) {
        this.dead = true;

        game.clearDoll();
        game.custom_callouts.push("The spooky doll has vanished.");
    }
}

const RoleGenerators = dict(
    [Role.VILLAGER, Villager],
    [Role.WEREWOLF, Werewolf],
    [Role.HEALER, Healer],
    [Role.SEER, Seer],
    [Role.WITCH, Witch],
    [Role.JESTER, Jester],
    [Role.PRIEST, Priest],
    [Role.VETERAN, Veteran],
    [Role.SPY, Spy],
    [Role.INVESTIGATOR, Investigator],
    [Role.WOLF_SEER, WolfSeer],
    [Role.ARSONIST, Arsonist],
    [Role.CREEPY_GIRL, CreepyGirl],
    [Role.DEATH_WITCH, DeathWitch]
)

const createPlayer = (id, name, image, color, role) => {
    console.log(role);
    var player = new (RoleGenerators[role])(id, name, image, color);
    player.init();
    return player;
};

const copyPlayer = (src, dst) => {
    dst.messages = src.messages;

    dst.doused = src.doused || false;
    dst.holds_doll = src.holds_doll || false;
};

const convertPlayer = (player, role) => {
    console.log("Converting", player.name, "to", role);
    var n = createPlayer(player.id, player.name, player.image, player.color, role);
    console.log("New player object", n);
    copyPlayer(player, n);
    console.log("Modified player object", n);
    return n;
};

export { createPlayer, Role };
