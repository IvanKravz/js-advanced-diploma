import GamePlay from './GamePlay'
import themes from './themes'
import Team from './Team'
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter'
import cursors from './cursors';
import GameState from './GameState'

import Bowman from './characters/Bowman'
import Magician from './characters/Magician'
import Swordsman from './characters/Swordsman'
import Daemon from './characters/Daemon'
import Undead from './characters/Undead'
import Vampire from './characters/Vampire'

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState();
    this.stateService = stateService;
    this.userTeam = new Team();
    this.rivalTeam = new Team();
    this.userHeroes = [Bowman, Swordsman, Magician];
    this.rivalHeroes = [Daemon, Undead, Vampire];
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.gameState.level])
    this.userTeam.addAll(generateTeam(this.userHeroes, 1, 2));
    this.rivalTeam.addAll(generateTeam(this.rivalHeroes, 1, 2));
    this.addHeroUser(this.userTeam, this.UserPositions());
    this.addHeroUser(this.rivalTeam, this.RivalPositions());
    this.gamePlay.redrawPositions(this.gameState.heroesList) // Добавляем персонажей на поле
    
    this.gamePlay.addCellEnterListener((index) => {
      this.onCellEnter(index);
    });

    this.gamePlay.addCellLeaveListener((index) => {
      this.onCellLeave(index);
    });

    this.gamePlay.addCellClickListener((index) => {
      this.onCellClick(index);
    });

    this.gamePlay.addNewGameListener(() => {
      const gameController = new GameController(this.gamePlay, this.stateService);
      gameController.init()
    });
    
    this.gamePlay.addSaveGameListener(() => {
      this.stateService.save(GameState.from(this.gameState));
      if (localStorage.getItem("state") === null) {
        GamePlay.showMessage('Игра не сохранилась')
      }
      GamePlay.showMessage('Игра сохранена')
    });

    this.gamePlay.addLoadGameListener(() => {
      const loadGame = this.stateService.load()
      if (!loadGame) {
        GamePlay.showError('Отсутствует сохраненная игра');
      }
      this.gameState.level = loadGame.level;
      this.gamePlay.drawUi(themes[loadGame.level]);
      this.gameState.permissionMove = loadGame.permissionMove;
      this.gameState.heroesList = [];
      this.gameState.points = loadGame.points;
      this.gameState.statistic = loadGame.statistic;
      this.gameState.characterSelected = loadGame.characterSelected;
      this.userTeam = new Team();
      this.rivalTeam = new Team();
      loadGame.heroesList.forEach((elem) => {
        let char;
        switch (elem.character.type) {
          case 'swordsman':
            char = new Swordsman(elem.character.level);
            this.userTeam.addAll([char]);
            break;
          case 'bowman':
            char = new Bowman(elem.character.level);
            this.userTeam.addAll([char]);
            break;
          case 'magician':
            char = new Magician(elem.character.level);
            this.userTeam.addAll([char]);
            break;
          case 'undead':
            char = new Undead(elem.character.level);
            this.rivalTeam.addAll([char]);
            break;
          case 'vampire':
            char = new Vampire(elem.character.level);
            this.rivalTeam.addAll([char]);
            break;
          case 'daemon':
            char = new Daemon(elem.character.level);
            this.rivalTeam.addAll([char]);
            break;
        }
        char.health = elem.character.health;
        this.gameState.heroesList.push(new PositionedCharacter(char, elem.position));
      });

      this.gamePlay.redrawPositions(this.gameState.heroesList);
      GamePlay.showMessage('Игра загружена')
    })
  }

  onCellClick(index) {
    // TODO: react to click

    if (this.UserIsCharacter(index) && this.gameState.permissionMove) {
      this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected'))
      this.gamePlay.selectCell(index)
      this.gameState.characterSelected = index
      } else if (!this.gameState.characterSelected && this.RivalIsCharacter(index)) {
        GamePlay.showError('Это не персонаж игрока');
    } 

    // Перемещение персонажа пользователя
    if (!this.UserIsCharacter(index) && this.getCellMove(index) && !this.RivalIsCharacter(index)) {
      if (this.gameState.permissionMove)
        this.userMoveClickCell(index);
        this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green'))
    }

    // Атака противника
    if (this.getCharacterByindex(index) && this.RivalIsCharacter(index)) {
      if (this.getCellAttack(index)) {
        this.getAttack(index);
        this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected'))
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter 

    if (this.UserIsCharacter(index)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (this.RivalIsCharacter(index)) {
      this.gamePlay.setCursor(cursors.pointer);
    } 

    if (this.getCharacterByindex(index)) {
      const hero = this.getCharacterByindex(index).character;
      const message = `\u{1F396}${hero.level}\u{2694}${hero.attack}\u{1F6E1}${hero.defence}\u{2764}${hero.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }

    // Подсвечивание ячейки где нет персонажа зеленым цветом и изменение курсора 
    if (!this.getCharacterByindex(index) && this.getCellMove(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } 
    
    if (this.RivalIsCharacter(index) && this.getCellAttack(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
      
    } else if (this.gameState.characterSelected && this.RivalIsCharacter(index) && !this.getCellAttack(index)) {
      this.gamePlay.setCursor(cursors.notallowed);
    } 
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-red'));
    this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green'))
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getCharacterByindex(idx) {
    // Функция возвращает объект, index которого совпадает с index клетки
    return this.gameState.heroesList.find((elem) => elem.position === idx);
     
  } 

  UserIsCharacter(idx) {
    // Функция возвращает true если выбранный герой совпадает с героями User из this.userHeroes
    if (this.getCharacterByindex(idx)) {
      const character = this.getCharacterByindex(idx).character;
      return this.userHeroes.some((elem) => character instanceof elem);
    }
    return false;
  }

  RivalIsCharacter(idx) {
    // Функция возвращает true если выбранный герой совпадает с героями Rival из this.rivalHeroes
    if (this.getCharacterByindex(idx)) {
      const character = this.getCharacterByindex(idx).character;
      return this.rivalHeroes.some((elem) => character instanceof elem);
    }
    return false;
  }

  UserPositions() {
    // Функция возможных позиций пользователя при начале игры
    const size = this.gamePlay.boardSize;
    this.userPosition = [];
    for (let i = 0, j = 1; this.userPosition.length < size * 2; i += size, j += size) {
      this.userPosition.push(i, j);
    }
    return this.userPosition;
  }

  RivalPositions() {
    // Функция возможных позиций противника при начале игры
    const size = this.gamePlay.boardSize;
    const botPosition = [];
    for (let i = size - 2, j = size - 1; botPosition.length < size * 2; i += size, j += size) {
      botPosition.push(i, j);
    }
    return botPosition;
  }

  randomPosition(positions) {
    const random = Math.floor(Math.random() * positions.length);
    return positions[random]
  }
  
  addHeroUser(team, positions) {
    // Функция создания массива героев пользователя и противника для дальнейщего добавления их на поле
    const copyPositions  = [...positions];
    for (const item of team.characters) {
      const random = this.randomPosition(copyPositions );
      this.gameState.heroesList.push(new PositionedCharacter(item, random));
      copyPositions.splice(copyPositions.indexOf(random), 1);
    }
  }
 
  getCellMove(index) {
    if (this.getSelectedCharacter()) {
      const moving = this.getSelectedCharacter().character.distance;
      const positionMove = this.calcPositionMove(this.getSelectedCharacter().position, moving);
      return positionMove.includes(index);
    }
    return false;
  }

  getCellAttack(index) {
    if (this.getSelectedCharacter()) {
      const attack = this.getSelectedCharacter().character.cellAtack;
      const positionAttack = this.calcPositionAttack(this.getSelectedCharacter(), attack);
      return positionAttack.includes(index);
    }
    return false;
  }

  getSelectedCharacter() {
    return this.gameState.heroesList.find((elem) => elem.position === this.gameState.characterSelected);
  }

  calcPositionMove(idx, char) {
    const brdSize = this.gamePlay.boardSize;
    const range = [];
    const leftBorder = [];
    const rightBorder = [];

    for (let i = 0, j = brdSize - 1; leftBorder.length < brdSize; i += brdSize, j += brdSize) {
      leftBorder.push(i);
      rightBorder.push(j);
    }

    for (let i = 1; i <= char; i += 1) {
      range.push(idx + (brdSize * i));
      range.push(idx - (brdSize * i));
    }

    for (let i = 1; i <= char; i += 1) {
      if (leftBorder.includes(idx)) {
        break;
      }
      range.push(idx - i);
      range.push(idx - (brdSize * i + i));
      range.push(idx + (brdSize * i - i));
      if (leftBorder.includes(idx - i)) {
        break;
      }
    }

    for (let i = 1; i <= char; i += 1) {
      if (rightBorder.includes(idx)) {
        break;
      }
      range.push(idx + i);
      range.push(idx - (brdSize * i - i));
      range.push(idx + (brdSize * i + i));
      if (rightBorder.includes(idx + i)) {
        break;
      }
    }

    return range.filter((elem) => elem >= 0 && elem <= (brdSize ** 2 - 1));
  }

  calcPositionAttack(currentPosition, distance) {
    const areaAttack = [];
    // Клетки по вертикали
    for (let i = currentPosition.position - this.gamePlay.boardSize * distance;
      i <= currentPosition.position + this.gamePlay.boardSize * distance;
      i += this.gamePlay.boardSize
    ) {
      // Клетки по горизонтали
      if ((i >= 0) && (i < this.gamePlay.boardSize ** 2)) {
        for (let j = i - distance; j <= i + distance; j += 1) {
          if (
            // Ограничиваем слева
            (j >= i - (i % this.gamePlay.boardSize))
            // Ограничиваем справа
            && (j < i + (this.gamePlay.boardSize - (i % this.gamePlay.boardSize)))
          ) {
            areaAttack.push(j);
          }
        }
      }
    }
    return areaAttack;
  }

  getAttack(index) {
    if (this.gameState.permissionMove) {
      const attacker = this.getCharacterByindex(this.gameState.characterSelected).character;
      const target = this.getCharacterByindex(index).character;
      const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
      if (!attacker || !target) {
        return;
      }
      this.gamePlay.showDamage(index, damage).then(() => {
        target.health -= damage;
        if (target.health <= 0) {
          this.getDeletion(index);
          this.rivalTeam.delete(target);
        }
      }).then(() => {
        this.gamePlay.redrawPositions(this.gameState.heroesList);
      }).then(() => {
        this.GameStatistic();
        this.rivalResponseAttack();
      });
      this.gameState.permissionMove = false;
    }
  }

  getDeletion(idx) {
    const state = this.gameState.heroesList;
    state.splice(state.indexOf(this.getCharacterByindex(idx)), 1);
  }

  // Функция движения героев пользователя в ячейку по которой был клик
  userMoveClickCell(index) {
    this.getSelectedCharacter().position = index;
    this.gamePlay.deselectCell(this.gameState.characterSelected);
    this.gamePlay.redrawPositions(this.gameState.heroesList);
    this.gameState.characterSelected = index;
    this.gameState.permissionMove = false;
    this.rivalResponseAttack();
  }

  rivalResponseAttack() {
    if (this.gameState.permissionMove) {
      return;
    }
    const rivalsTeam = this.gameState.heroesList.filter((event) => (
      event.character instanceof Vampire || event.character instanceof Daemon || event.character instanceof Undead
    ));
    const usersTeam = this.gameState.heroesList.filter((event) => (
      event.character instanceof Bowman || event.character instanceof Swordsman || event.character instanceof Magician
    ));

    let rival = null;
    let target = null;

    if (rivalsTeam.length === 0 || usersTeam.length === 0) {
      return;
    }

    rivalsTeam.forEach((elem) => {
      const rangeAttack = this.calcPositionAttack(elem, elem.character.cellAtack);
      usersTeam.forEach((hero) => {
        if (rangeAttack.includes(hero.position)) {
          rival = elem;
          target = hero;
        }
      });
    });

    if (target) {
      const damage = Math.max(
        rival.character.attack - target.character.defence, rival.character.attack * 0.1,
      );
      this.gamePlay.showDamage(target.position, damage).then(() => {
        target.character.health -= damage;
        if (target.character.health <= 0) {
          this.getDeletion(target.position);
          this.userTeam.delete(target.character);
          this.gamePlay.deselectCell(this.gameState.characterSelected);
        }
      }).then(() => {
        this.gamePlay.redrawPositions(this.gameState.heroesList);
        this.gameState.permissionMove = true;
        this.gameState.characterSelected = null;
      }).then(() => {
        this.GameStatistic();
      });
    } else {
      rival = rivalsTeam[Math.floor(Math.random() * rivalsTeam.length)];
      const rivalRange = this.calcPositionMove(rival.position, rival.character.distance);
      rivalRange.forEach((event) => {
        this.gameState.heroesList.forEach((i) => {
          if (event === i.position) {
            rivalRange.splice(rivalRange.indexOf(i.position), 1);
          }
        });
      });
      const rivalPosition = this.getRandom(rivalRange);
      rival.position = rivalPosition;
      this.gamePlay.redrawPositions(this.gameState.heroesList);
      this.gameState.permissionMove = true;
    }
  }

  getRandom(positions) {
    this.positions = positions;
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  GameStatistic() {
    let sumPoints = this.gameState.statistic.reduce((a, b) => a + b, 0);
    
    if (this.userTeam.characters.size === 0) {
      this.gameState.statistic.push(this.gameState.points);
      GamePlay.showMessage(`Вы проиграли, количество очков ${sumPoints + this.gameState.points}`);
    }

    if (this.rivalTeam.characters.size === 0 && this.gameState.level <= 3) {
      this.gameState.permissionMove = true;
      this.scorePoints();
      this.gameState.statistic.push(this.gameState.points);
      GamePlay.showMessage(`Вы прошли уровень ${this.gameState.level}, количество очков за уровень ${this.gameState.points}`);
      this.gameState.level += 1;
      this.nextLevel()
    }

    if (this.rivalTeam.characters.size === 0 && this.gameState.level === 4) {
      this.scorePoints();
      this.gameState.statistic.push(this.gameState.points);
      GamePlay.showMessage(`Вы прошли игру, количество очков за игру ${sumPoints + this.gameState.points}`);
    }
  }

  scorePoints() {
    this.gameState.points += this.userTeam.toArray().reduce((a, b) => a + b.health, 0);
  }

  nextLevel() {
    this.gameState.heroesList = [];
    this.userTeam.characters.forEach((char) => char.levelUp());

    if (this.gameState.level === 2) {
      this.userTeam.addAll(generateTeam(this.userHeroes, 2, 1));
      this.rivalTeam.addAll(generateTeam(this.rivalHeroes, 2, 3));
    }

    if (this.gameState.level === 3) {
      this.userTeam.addAll(generateTeam(this.userHeroes, 2, 0));
      this.rivalTeam.addAll(generateTeam(this.rivalHeroes, 2, 3));
    }

    if (this.gameState.level === 4) {
      this.userTeam.addAll(generateTeam(this.userHeroes, 2, 1));
      this.rivalTeam.addAll(generateTeam(this.rivalHeroes, 2, 4));
    }

    GamePlay.showMessage(`Уровень ${this.gameState.level}`);
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.addHeroUser(this.userTeam, this.UserPositions());
    this.addHeroUser(this.rivalTeam, this.RivalPositions());
    this.gamePlay.redrawPositions(this.gameState.heroesList);
  }

}
