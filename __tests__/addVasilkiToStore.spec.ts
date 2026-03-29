import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'
import { MAX_VASILKI } from '@/types'

describe('useGameStore - addVasilki', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('увеличивает количество васильков на 1, не превышая MAX_VASILKI', () => {
    const store = useGameStore()

    // базовый кейс: с 0 до 1
    expect(store.vasilkiCount).toBe(0)
    store.addVasilki()
    expect(store.vasilkiCount).toBe(1)

    // кейс ограничения сверху: не выше MAX_VASILKI
    // устанавливаем почти максимум и вызываем несколько раз
    store.vasilkiCount = MAX_VASILKI - 1
    store.addVasilki()
    expect(store.vasilkiCount).toBe(MAX_VASILKI)

    store.addVasilki()
    expect(store.vasilkiCount).toBe(MAX_VASILKI)
  })
})
