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
    this.userTeam = new Team()
    this.rivalTeam = new Team()
    this.userHeroes = [Bowman, Swordsman, Magician];
    this.rivalHeroes = [Daemon, Undead, Vampire]
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.gameState.level])
    this.userTeam.add(generateTeam(this.userHeroes, 1, 3));
    this.rivalTeam.add(generateTeam(this.rivalHeroes, 1, 3));
    this.addHeroUser(this.userTeam.characters)
    this.addHeroUser(this.rivalTeam.characters)
    this.gamePlay.redrawPositions(this.gameState.heroesList) // Добавляем персонажей на поле
    
    // this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addCellEnterListener((index) => {
      this.onCellEnter(index);
    })

    this.gamePlay.addCellLeaveListener((index) => {
      this.onCellLeave(index);
    })

    this.gamePlay.addCellClickListener((index) => {
      this.onCellClick(index);
      
    })
  }

  onCellClick(index) {
    // TODO: react to click
    let cellArray = this.gamePlay.containerCells()

    if (this.UserIsCharacter(index) && this.gameState.permissionMove) {
      cellArray.forEach((elem) => elem.classList.remove('selected'))
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

    // Атака персонажом пользователя
    if (this.getCharacterByindex(index) && this.RivalIsCharacter(index)) {
      if (this.getCellAttack(index)) {
        this.getAttack(index, this.gameState.characterSelected);
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
  
  addHeroUser(heroes) {
    // Функция создания массива героев пользователя и противника для дальнейщего добавления их на поле
    let userHero = ['swordsman', 'bowman', 'magician']
    let rivalHero = ['daemon', 'undead', 'vampire']
    let userPositions = this.UserPositions();
    let rivalPositions = this.RivalPositions();

    for (let hero of heroes) {
        for (let i = 0; i < hero.length; i += 1) {
          if (userHero.includes(hero[i].type)) {
            let randomPosition = this.randomPosition(userPositions)
            const positionedCharacter = new PositionedCharacter(hero[i], randomPosition);
            userPositions.splice(userPositions.indexOf(randomPosition), 1)
            this.gameState.heroesList.push(positionedCharacter)
        } else if (rivalHero.includes(hero[i].type)) {
          let randomPosition = this.randomPosition(rivalPositions)
            const positionedCharacter = new PositionedCharacter(hero[i], randomPosition);
            rivalPositions.splice(rivalPositions.indexOf(randomPosition), 1)
            this.gameState.heroesList.push(positionedCharacter)
        }
      }  
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
          console.log('this.getDeletion(index)', this.getDeletion(index))
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
    
  }

  scorePoints() {
    
  }

  levelUp() {
    
  }

  
}
