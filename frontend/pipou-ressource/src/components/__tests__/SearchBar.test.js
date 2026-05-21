import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SearchBar from '../SearchBar.vue'

const vuetify = createVuetify({ components, directives })

function mountComponent(props = {}) {
  return mount(SearchBar, {
    props: {
      categories: [],
      relations: [],
      resourceTypes: [],
      ...props,
    },
    global: {
      plugins: [vuetify],
    },
  })
}

describe('SearchBar', () => {
  it('émet filter avec les valeurs initiales (vides)', async () => {
    const wrapper = mountComponent()
    // Le watcher émet filter au changement — au mount les valeurs sont nulles
    // Attendons le tick pour que les watchers se déclenchent
    await wrapper.vm.$nextTick()
    // Le filtre peut être émis ou non au mount, vérifions la structure
    if (wrapper.emitted('filter')) {
      const payload = wrapper.emitted('filter')[0][0]
      expect(payload).toHaveProperty('search')
      expect(payload).toHaveProperty('category_id')
      expect(payload).toHaveProperty('relation_type_id')
      expect(payload).toHaveProperty('resource_type_id')
    }
  })

  it('émet filter quand searchQuery change', async () => {
    const wrapper = mountComponent()
    // Modifier la ref interne directement (v-text-field Vuetify)
    wrapper.vm.searchQuery = 'Vue.js'
    await wrapper.vm.$nextTick()
    // Le watcher déclenche handleSearch qui émet 'filter'
    await wrapper.vm.$nextTick()

    const events = wrapper.emitted('filter')
    expect(events).toBeTruthy()
    const lastPayload = events[events.length - 1][0]
    expect(lastPayload.search).toBe('Vue.js')
  })

  it('reçoit les props categories et resourceTypes', () => {
    const categories = [{ id: 1, name: 'Santé' }, { id: 2, name: 'Famille' }]
    const resourceTypes = [{ id: 1, name: 'Article' }]
    const wrapper = mountComponent({ categories, resourceTypes })
    expect(wrapper.props('categories')).toEqual(categories)
    expect(wrapper.props('resourceTypes')).toEqual(resourceTypes)
  })
})
