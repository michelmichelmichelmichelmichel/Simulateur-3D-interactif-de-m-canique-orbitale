import { describe, it, expect, vi } from 'vitest'
import EventEmitter from '../src/Experience/Utils/EventEmitter.js'

describe('EventEmitter', () => {
  it('appelle les callbacks enregistrés avec les arguments', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()
    emitter.on('tick', callback)
    emitter.trigger('tick', 42)
    expect(callback).toHaveBeenCalledWith(42)
  })

  it("n'appelle plus un callback retiré", () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()
    emitter.on('tick', callback).off('tick', callback)
    emitter.trigger('tick')
    expect(callback).not.toHaveBeenCalled()
  })

  it('ignore un événement sans abonné', () => {
    expect(() => new EventEmitter().trigger('inconnu')).not.toThrow()
  })
})
