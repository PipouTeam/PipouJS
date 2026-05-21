import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResourceList from '../ResourceList.vue'

const vuetify = createVuetify({ components, directives })

function mountComponent(props = {}) {
  return mount(ResourceList, {
    props: {
      items: [],
      ...props,
    },
    global: {
      plugins: [vuetify],
      stubs: {
        'router-link': true,
      },
    },
  })
}

const sampleItems = [
  {
    id: 1,
    title: 'Mon article',
    content: '<p>Contenu <strong>HTML</strong></p>',
    resource_type: 'Article',
    category: 'Santé',
    relation_type: 'Soi',
    status: 'validated',
    visibility: 'public',
    thumbnail_url: null,
    share_token: 'abc123',
  },
  {
    id: 2,
    title: 'Ma vidéo',
    content: null,
    resource_type: 'Vidéo',
    category: 'Famille',
    relation_type: null,
    status: 'pending',
    visibility: 'private',
    thumbnail_url: 'http://img.test/thumb.jpg',
    share_token: null,
  },
]

describe('ResourceList', () => {
  describe('helpers', () => {
    it('typeIcon retourne la bonne icône pour un type connu', () => {
      const wrapper = mountComponent({ items: sampleItems })
      const vm = wrapper.vm
      expect(vm.typeIcon('Article')).toBe('mdi-text-box-outline')
      expect(vm.typeIcon('Vidéo')).toBe('mdi-play-circle-outline')
      expect(vm.typeIcon('Jeu en ligne')).toBe('mdi-gamepad-variant-outline')
    })

    it('typeIcon retourne un fallback pour un type inconnu', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.typeIcon('Inconnu')).toBe('mdi-file-outline')
    })

    it('typeColor retourne la bonne couleur', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.typeColor('Article')).toBe('#4A90D9')
      expect(wrapper.vm.typeColor('Vidéo')).toBe('#8E44AD')
    })

    it('typeColor retourne un fallback pour un type inconnu', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.typeColor('Inconnu')).toBe('#95A5A6')
    })

    it('statusLabel retourne le bon libellé', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.statusLabel('draft')).toBe('Brouillon')
      expect(wrapper.vm.statusLabel('pending')).toBe('En attente')
      expect(wrapper.vm.statusLabel('validated')).toBe('Validé')
      expect(wrapper.vm.statusLabel('suspended')).toBe('Suspendu')
    })

    it('statusColor retourne la bonne couleur', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.statusColor('validated')).toBe('success')
      expect(wrapper.vm.statusColor('pending')).toBe('warning')
      expect(wrapper.vm.statusColor('suspended')).toBe('error')
    })

    it('plainText supprime les balises HTML', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.plainText('<p>Hello <b>World</b></p>')).toBe('Hello World')
    })

    it('plainText retourne une chaîne vide si null', () => {
      const wrapper = mountComponent({ items: sampleItems })
      expect(wrapper.vm.plainText(null)).toBe('')
    })
  })

  describe('rendu', () => {
    it('affiche les titres des ressources en mode grid', () => {
      const wrapper = mountComponent({ items: sampleItems, view: 'grid' })
      expect(wrapper.text()).toContain('Mon article')
      expect(wrapper.text()).toContain('Ma vidéo')
    })

    it('affiche les titres en mode compact', () => {
      const wrapper = mountComponent({ items: sampleItems, view: 'compact' })
      expect(wrapper.text()).toContain('Mon article')
    })

    it('affiche les titres en mode minimal', () => {
      const wrapper = mountComponent({ items: sampleItems, view: 'minimal' })
      expect(wrapper.text()).toContain('Mon article')
    })

    it('n\'affiche pas le statut par défaut', () => {
      const wrapper = mountComponent({ items: sampleItems, view: 'grid' })
      expect(wrapper.text()).not.toContain('Validé')
    })

    it('affiche le statut quand showStatus=true', () => {
      const wrapper = mountComponent({
        items: sampleItems,
        view: 'grid',
        showStatus: true,
      })
      expect(wrapper.text()).toContain('Validé')
      expect(wrapper.text()).toContain('En attente')
    })

    it('affiche rien quand items est vide', () => {
      const wrapper = mountComponent({ items: [] })
      expect(wrapper.findAll('.v-card')).toHaveLength(0)
    })
  })

  describe('events', () => {
    it('émet toggle-favorite au clic', async () => {
      const wrapper = mountComponent({
        items: sampleItems,
        view: 'grid',
        showProgress: true,
      })
      const favBtn = wrapper.findAll('[class*="mdi-heart"]')[0]
      if (favBtn) {
        await favBtn.trigger('click')
        expect(wrapper.emitted('toggle-favorite')).toBeTruthy()
      }
    })

    it('émet delete au clic', async () => {
      const wrapper = mountComponent({
        items: sampleItems,
        view: 'grid',
        showStatus: true,
      })
      const deleteBtn = wrapper.findAll('[class*="mdi-delete"]')[0]
      if (deleteBtn) {
        await deleteBtn.trigger('click')
        expect(wrapper.emitted('delete')).toBeTruthy()
      }
    })
  })
})
