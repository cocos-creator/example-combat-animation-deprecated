var Game = require('Game');
var Globals = require('Globals');

var BattleMng = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        // team count
        teamCount: 0,
        // get fighters
        fighterTemplate: {
            default: null,
            type: cc.Node
        },
        batchNode: {
            default: null,
            type: cc.Node
        },
        playerHPBars: {
            default: [],
            type: [cc.Node]
        },
        enemyHPBars: {
            default: [],
            type: [cc.Node]
        },
        playerLocs: {
            default: [],
            type: [cc.Node]
        },
        enemyLocs: {
            default: [],
            type: [cc.Node]
        }
    },
    init: function(battleInfo) {
        // attackers list
        // this.attackerQueue = [];
        // fighters
        this.fighters = [];
        this.players = [];
        this.enemies = [];
        for (var i = 0; i < this.teamCount; ++i) {
            // player
            var playerF = this._createFighter(i, false);
            var enemyF = this._createFighter(i, true);
            this.players[i] = playerF;
            this.enemies[i] = enemyF;
            var levelMod = Game.instance.assetMng.getLevelModifier(battleInfo.level);
            var playerInfo = Game.instance.assetMng.getFighterInfo(battleInfo.players[i]);
            var enemyInfo = Game.instance.assetMng.getLevelEnemyInfo(battleInfo.level, i);
            // init
            playerF.init(playerInfo);
            enemyF.init(enemyInfo, levelMod);
            playerF.setHPBar(this.playerHPBars[i]);
            enemyF.setHPBar(this.enemyHPBars[i]);

            this.batchNode.addChild(enemyF, 3 - i);
            this.batchNode.addChild(playerF, 3 - i);
            playerF.initZ = 3 - i;
            enemyF.initZ = 3 - i;
            // playerF.setInitZ(3 - i);
            // enemyF.setInitZ(3 - i);
            var pPos = this.playerLocs[i].getPosition();
            var ePos = this.enemyLocs[i].getPosition();
            playerF.setPosition(pPos);
            enemyF.setPosition(ePos);
            playerF.selfPos = pPos;
            enemyF.selfPos = ePos;

            playerF.initActions();
            enemyF.initActions();
            // indexed
            this.fighters.push(enemyF);
            this.fighters.push(playerF);
        }
        // this.ready = true;
    },

    _createFighter: function(index, isEnemy) {
        var fighter = Fire.instantiate(this.fighterTemplate);
        fighter.setName((isEnemy ? 'enemy' : 'player') + index);
        fighter.isEnemy = isEnemy;
        fighter.attackOffset = isEnemy ? -100 : 100;
        fighter.setScaleX(isEnemy ? 1 : -1);
        return fighter;
    },

    orderAttack: function(fighter) {
        var target;
        if (fighter.isEnemy) {
            target = this._pickTargetFrom(this.players);
        } else {
            target = this._pickTargetFrom(this.enemies);
        }
        if (!target || target.isDead ) return;
        fighter.moveToAttack(target);
        // this.attackerQueue.push({fighter: fighter, modifier: modifier});
    },

    launchAttack: function(fighter, modifier) {
        // this.attackerQueue.shift();
        var dmg = calculateDmg(fighter, modifier);
        fighter.targetFighter.dmgTaken = dmg;
    },

    setAttackZ: function(fighter) {
        this.batchNode.reorderChild(fighter, 5);
    },

    restoreZ: function(fighter) {
        this.batchNode.reorderChild(fighter, fighter.initZ);
    },

    _pickTargetFrom: function(list) {
        for (var i = 0; i < list.length; ++i) {
            if (!list[i].isDead) return list[i];
        }
        return null;
    },

    fighterDie: function(fighter) {
        Game.instance.timeline.retireFighterIcon(fighter);
        fighter.isDead = true;
        this._checkTeamVictory(fighter.isEnemy);
    },

    _checkTeamVictory: function(isEnemy) {
        var team = null;
        var teamLose = true;
        if (isEnemy) {
            team = this.enemies;
        } else {
            team = this.players;
        }
        for (var i = 0; i < team.length; ++i) {
            if (!team[i].isDead) {
                teamLose = false;
                break;
            }
        }
        if (teamLose) {
            this.unscheduleUpdate();
            if (isEnemy) {
                Game.instance.victory();
            } else {
                Game.instance.defeat();
            }
        }
    }
});

function calculateDmg(fighter, modifier) {
    var dmg = 0;
    if (!fighter.isEnemy) { // player attack
        dmg = Game.instance.cheat ? 10000 : fighter.atk * modifier;
    } else { // enemy attack
        dmg = fighter.atk / modifier;
    }
    return Math.floor(dmg);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
