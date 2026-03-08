import Phaser from 'phaser'
import { Item } from '../entities/index.js'
import { ITEMS, getRandomItem } from '../config/index.js'

export class ItemSystem {
  private scene: Phaser.Scene
  private inventory: Item[] = []
  private maxInventorySize: number = 6
  private selectedItem: Item | null = null
  private onItemUsed: (item: Item) => void
  
  constructor(scene: Phaser.Scene, onItemUsed: (item: Item) => void) {
    this.scene = scene
    this.onItemUsed = onItemUsed
  }
  
  dropItem(x: number, y: number): Item | null {
    if (this.inventory.length >= this.maxInventorySize) {
      return null
    }
    
    const itemId = getRandomItem()
    const itemConfig = ITEMS[itemId]
    
    if (!itemConfig) return null
    
    const item = new Item(this.scene, x, y, itemConfig)
    
    item.on('pointerdown', () => {
      this.selectItem(item)
    })
    
    this.inventory.push(item)
    
    this.animateDrop(item)
    
    return item
  }
  
  private animateDrop(item: Item): void {
    item.setScale(0)
    item.setAlpha(0)
    
    this.scene.tweens.add({
      targets: item,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.out',
    })
  }
  
  selectItem(item: Item): void {
    if (this.selectedItem === item) {
      this.selectedItem = null
      this.resetItemScale()
    } else {
      this.selectedItem = item
      this.resetItemScale()
      this.scene.tweens.add({
        targets: item,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
      })
    }
  }
  
  private resetItemScale(): void {
    for (const item of this.inventory) {
      this.scene.tweens.add({
        targets: item,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      })
    }
  }
  
  useSelectedItem(target: any): boolean {
    if (!this.selectedItem) return false
    
    if (this.selectedItem.config.type === 'consumable') {
      return this.useConsumableItem(target)
    } else {
      return this.equipItem(target)
    }
  }
  
  private useConsumableItem(target: any): boolean {
    if (!this.selectedItem) return false
    
    const success = this.selectedItem.equip(target)
    
    if (success) {
      this.removeItemFromInventory(this.selectedItem)
      this.selectedItem.destroy()
      this.selectedItem = null
      this.onItemUsed(this.selectedItem!)
    }
    
    return success
  }
  
  private equipItem(plant: any): boolean {
    if (!this.selectedItem) return false
    
    const success = this.selectedItem.equip(plant)
    
    if (success) {
      this.removeItemFromInventory(this.selectedItem)
      this.onItemUsed(this.selectedItem!)
    }
    
    return success
  }
  
  private removeItemFromInventory(item: Item): void {
    const index = this.inventory.indexOf(item)
    if (index > -1) {
      this.inventory.splice(index, 1)
    }
  }
  
  getSelectedItem(): Item | null {
    return this.selectedItem
  }
  
  getInventory(): Item[] {
    return [...this.inventory]
  }
  
  isInventoryFull(): boolean {
    return this.inventory.length >= this.maxInventorySize
  }
  
  getEmptySlots(): number {
    return this.maxInventorySize - this.inventory.length
  }
  
  clear(): void {
    for (const item of this.inventory) {
      if (!item.equipped) {
        item.destroy()
      }
    }
    this.inventory = []
    this.selectedItem = null
  }
  
  arrangeItems(startX: number, startY: number, spacing: number): void {
    for (let i = 0; i < this.inventory.length; i++) {
      const item = this.inventory[i]
      const x = startX + (i % 3) * spacing
      const y = startY + Math.floor(i / 3) * spacing
      
      this.scene.tweens.add({
        targets: item,
        x: x,
        y: y,
        duration: 200,
        ease: 'Power2',
      })
    }
  }
}
