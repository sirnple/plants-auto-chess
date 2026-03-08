import Phaser from 'phaser'

type SoundType = 
  | 'attack'
  | 'hit'
  | 'shoot'
  | 'explosion'
  | 'merge'
  | 'buy'
  | 'sell'
  | 'gameover'
  | 'win'
  | 'bgm'

export class AudioSystem {
  private scene: Phaser.Scene
  private sounds: Map<SoundType, Phaser.Sound.BaseSound>
  private bgm: Phaser.Sound.BaseSound | null = null
  private isMuted: boolean = false
  private volume: number = 0.5
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.sounds = new Map()
    
    this.createPlaceholderSounds()
  }
  
  private createPlaceholderSounds(): void {
    for (const soundType of ['attack', 'hit', 'shoot', 'explosion', 'merge', 'buy', 'sell', 'gameover', 'win'] as SoundType[]) {
      const sound = this.scene.sound.add(soundType, { volume: this.volume })
      this.sounds.set(soundType, sound)
    }
  }
  
  play(soundType: SoundType): void {
    if (this.isMuted) return
    
    const sound = this.sounds.get(soundType)
    if (sound) {
      sound.play()
    }
  }
  
  playBGM(): void {
    if (this.isMuted || this.bgm?.isPlaying) return
    
    if (!this.bgm) {
      this.bgm = this.scene.sound.add('bgm', { 
        volume: this.volume * 0.5,
        loop: true,
      })
    }
    
    this.bgm.play()
  }
  
  stopBGM(): void {
    if (this.bgm?.isPlaying) {
      this.bgm.stop()
    }
  }
  
  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    
    if (this.isMuted) {
      this.scene.sound.mute = true
    } else {
      this.scene.sound.mute = false
    }
    
    return this.isMuted
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.scene.sound.volume = this.volume
  }
  
  isPlaying(soundType: SoundType): boolean {
    const sound = this.sounds.get(soundType)
    return sound?.isPlaying || false
  }
}
