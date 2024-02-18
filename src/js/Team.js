/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor() {
    this.characters = new Set();
  }

  add(character) {
    if (this.characters.has(character)) {
      throw new Error (`Объект с именем ${character.name} уже существует`)
    } else {
      this.characters.add(character)
    }
  }

  addAll(characters) {
    this.characters = new Set([...this.characters, ...characters]);
  }

  toArray() {
    return Array.from(this.characters)
  }

  clearSet(){
    this.characters.clear()
  }

  delete(elem) {
    this.characters.delete(elem)
  }
}
