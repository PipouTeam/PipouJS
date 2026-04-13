<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div v-if="editor" class="tiptap-toolbar d-flex flex-wrap ga-1 pa-2 rounded-t-lg" style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-bottom: none; background: #FAFAFA">
      <v-btn-group variant="text" density="compact" divided>
        <v-btn size="small" :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run()" icon="mdi-format-bold" />
        <v-btn size="small" :active="editor.isActive('italic')" @click="editor.chain().focus().toggleItalic().run()" icon="mdi-format-italic" />
        <v-btn size="small" :active="editor.isActive('underline')" @click="editor.chain().focus().toggleUnderline().run()" icon="mdi-format-underline" />
        <v-btn size="small" :active="editor.isActive('strike')" @click="editor.chain().focus().toggleStrike().run()" icon="mdi-format-strikethrough" />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact" divided>
        <v-btn size="small" :active="editor.isActive('heading', { level: 2 })" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" icon="mdi-format-header-2" />
        <v-btn size="small" :active="editor.isActive('heading', { level: 3 })" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" icon="mdi-format-header-3" />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact" divided>
        <v-btn size="small" :active="editor.isActive('bulletList')" @click="editor.chain().focus().toggleBulletList().run()" icon="mdi-format-list-bulleted" />
        <v-btn size="small" :active="editor.isActive('orderedList')" @click="editor.chain().focus().toggleOrderedList().run()" icon="mdi-format-list-numbered" />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact" divided>
        <v-btn size="small" :active="editor.isActive({ textAlign: 'left' })" @click="editor.chain().focus().setTextAlign('left').run()" icon="mdi-format-align-left" />
        <v-btn size="small" :active="editor.isActive({ textAlign: 'center' })" @click="editor.chain().focus().setTextAlign('center').run()" icon="mdi-format-align-center" />
        <v-btn size="small" :active="editor.isActive({ textAlign: 'right' })" @click="editor.chain().focus().setTextAlign('right').run()" icon="mdi-format-align-right" />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn size="small" variant="text" density="compact" icon="mdi-format-quote-close" :active="editor.isActive('blockquote')" @click="editor.chain().focus().toggleBlockquote().run()" />
      <v-btn size="small" variant="text" density="compact" icon="mdi-minus" @click="editor.chain().focus().setHorizontalRule().run()" />
    </div>

    <!-- Editor -->
    <editor-content :editor="editor" class="tiptap-content" />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.tiptap-content .tiptap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 0 0 8px 8px;
  padding: 12px 16px;
  min-height: 200px;
  outline: none;
}

.tiptap-content .tiptap:focus {
  border-color: rgb(var(--v-theme-primary));
}

.tiptap-content .tiptap h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}

.tiptap-content .tiptap h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}

.tiptap-content .tiptap p {
  margin: 0.5em 0;
}

.tiptap-content .tiptap ul,
.tiptap-content .tiptap ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.tiptap-content .tiptap blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #666;
}

.tiptap-content .tiptap hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1em 0;
}
</style>
