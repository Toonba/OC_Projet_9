// Ici on simule l'interface localStorage mais on va utiliser une variable store au lieu du véritable localStorage du navigateur
export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return JSON.stringify(store[key])
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()