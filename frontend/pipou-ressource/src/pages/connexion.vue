<template>
  <v-container class="mx-auto py-12" max-width="480">

    <!-- En-tête -->
    <div class="text-center mb-8">
      <v-icon icon="mdi-account-circle-outline" size="56" color="primary" class="mb-3" />
      <h1 class="text-h5 font-weight-bold text-primary">Espace personnel</h1>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Plateforme Ressource Relationnelle — Ministère de la Santé
      </p>
    </div>

    <!-- Card principale -->
    <v-card variant="outlined" rounded="lg" class="pa-2">

      <!-- Onglets -->
      <v-tabs
        v-model="activeTab"
        color="primary"
        slider-color="primary"
        align-tabs="center"
        class="mb-2"
      >
        <v-tab value="connexion">Se connecter</v-tab>
        <v-tab value="inscription">Créer un compte</v-tab>
      </v-tabs>

      <v-divider class="border-opacity-25" />

      <v-window v-model="activeTab" class="pa-6">

        <!-- Onglet Connexion -->
        <v-window-item value="connexion">
          <v-form ref="loginFormRef" @submit.prevent="handleLogin">
            <p class="text-body-2 text-grey-darken-2 mb-6">
              Connectez-vous pour accéder à vos ressources et à votre espace personnel.
            </p>

            <v-text-field
              v-model="loginForm.email"
              label="Adresse e-mail"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              autocomplete="email"
              :rules="rules.email"
            />

            <v-text-field
              v-model="loginForm.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              variant="outlined"
              density="comfortable"
              class="mb-1"
              autocomplete="current-password"
              :rules="rules.required"
              @click:append-inner="showPassword = !showPassword"
            />

            <div class="d-flex justify-end mb-6">
              <a href="#" class="text-caption text-primary text-decoration-none">
                Mot de passe oublié ?
              </a>
            </div>

            <v-alert
              v-if="loginError"
              type="error"
              variant="tonal"
              rounded="sm"
              density="compact"
              class="mb-4"
            >
              {{ loginError }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              rounded="sm"
              size="large"
              block
              prepend-icon="mdi-login"
              :loading="loginLoading"
            >
              Se connecter
            </v-btn>
          </v-form>
        </v-window-item>

        <!-- Onglet Inscription -->
        <v-window-item value="inscription">
          <v-form ref="registerFormRef" @submit.prevent="handleRegister">
            <p class="text-body-2 text-grey-darken-2 mb-6">
              Créez votre compte pour accéder à l'ensemble des ressources et fonctionnalités de la plateforme.
            </p>

            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="registerForm.firstName"
                  label="Prénom"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  density="comfortable"
                  autocomplete="given-name"
                  :rules="rules.required"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registerForm.lastName"
                  label="Nom"
                  variant="outlined"
                  density="comfortable"
                  autocomplete="family-name"
                  :rules="rules.required"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="registerForm.email"
              label="Adresse e-mail"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              autocomplete="email"
              :rules="rules.email"
            />

            <v-text-field
              v-model="registerForm.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              autocomplete="new-password"
              :rules="rules.password"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-text-field
              v-model="registerForm.confirmPassword"
              label="Confirmer le mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              density="comfortable"
              class="mb-6"
              autocomplete="new-password"
              :rules="rules.confirmPassword"
            />

            <v-alert
              v-if="registerError"
              type="error"
              variant="tonal"
              rounded="sm"
              density="compact"
              class="mb-4"
            >
              {{ registerError }}
            </v-alert>

            <v-alert
              v-if="registerSuccess"
              type="success"
              variant="tonal"
              rounded="sm"
              density="compact"
              class="mb-4"
            >
              Compte créé ! Vous pouvez maintenant vous connecter.
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              rounded="sm"
              size="large"
              block
              prepend-icon="mdi-account-plus-outline"
              :loading="registerLoading"
            >
              Créer mon compte
            </v-btn>
          </v-form>
        </v-window-item>

      </v-window>
    </v-card>

    <!-- Mention RGPD -->
    <p class="text-caption text-grey text-center mt-6">
      Vos données sont traitées conformément au RGPD.
      <a href="/mentions" class="text-primary text-decoration-none">En savoir plus</a>
    </p>

  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const activeTab    = ref('connexion')
const showPassword = ref(false)

const loginFormRef    = ref(null)
const registerFormRef = ref(null)

const loginForm    = ref({ email: '', password: '' })
const loginLoading = ref(false)
const loginError   = ref('')

const registerForm    = ref({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
const registerLoading = ref(false)
const registerError   = ref('')
const registerSuccess = ref(false)

// Règles de validation
const rules = {
  required: [
    v => !!v?.trim() || 'Ce champ est obligatoire.',
  ],
  email: [
    v => !!v?.trim()              || 'L\'adresse e-mail est obligatoire.',
    v => /.+@.+\..+/.test(v)     || 'Format d\'adresse e-mail invalide.',
  ],
  password: [
    v => !!v                      || 'Le mot de passe est obligatoire.',
    v => v.length >= 8            || 'Le mot de passe doit contenir au moins 8 caractères.',
  ],
  get confirmPassword() {
    return [
      v => !!v                                          || 'Veuillez confirmer votre mot de passe.',
      v => v === registerForm.value.password            || 'Les mots de passe ne correspondent pas.',
    ]
  },
}

async function handleLogin() {
  const { valid } = await loginFormRef.value.validate()
  if (!valid) return

  loginError.value   = ''
  loginLoading.value = true
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    router.push('/')
  } catch (e) {
    loginError.value = e.message
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  const { valid } = await registerFormRef.value.validate()
  if (!valid) return

  registerError.value   = ''
  registerSuccess.value = false
  registerLoading.value = true
  try {
    await authStore.register(
      registerForm.value.firstName,
      registerForm.value.lastName,
      registerForm.value.email,
      registerForm.value.password,
    )
    registerSuccess.value = true
    registerForm.value = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
    registerFormRef.value.reset()
    setTimeout(() => { activeTab.value = 'connexion' }, 2000)
  } catch (e) {
    registerError.value = e.message
  } finally {
    registerLoading.value = false
  }
}
</script>
