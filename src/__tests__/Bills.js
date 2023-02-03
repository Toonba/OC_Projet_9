/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'

import router from '../app/Router.js'

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      // ici on prépare l'environnement de test on va donc définir la propriété localStorage de l'objet windows On va spécifier le type de l'utilisateur dans cette propriété ici sur Employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      )
      // ici on créer une div et on l'ajoute au body pour avoir un environnement de test indépendant de l'HTML actuel
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // On utilise waitFor pour attendre l'affichage de l'élément ayant le data-testid 'icone-window' une fois qu'il est afficher on l'assigne à la variable windowIcon
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList[0]).toBe('active-icon')
    })
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      // ici le regex permet de trouver des chain de carractère répondant à un format de date AAAA-MM-JJ avec - . ou / comme séparateur. On va donc récupérer tous les éléments du DOM qui comprennent une date et va utiliser map pour stocker le contenue de ces élement dans dans un tableau date
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML)
      // antiChrono est une fonction qui compare deux élément et retourne 1 si le premier est inférieur au deuxième ou -1 si c'est l'inverse elle va être utilisé ensuite comme fonction comparatrice pour la méthode sort, cette méthode passe deux élément à une fonction comparatrice si la fonction comparatrice retourne un nombre inférieur à 0 l'élement courant est considéré inférieur à l'élement suivant, si c'est = 0 alors les deux éléments sont considéré égaux, si supérieur à 1 alors l'élement courant est considéré supérieur à l'élement suivant.
      // Dans notre cas la fonction comparatrice retourn 1 si a < b et -1 si a > b elle fait  donc un tris antichronologique du plus récent au plus ancien alors que nous souhaitons l'inverse il faut donc écrire ((a < b) ? -1 : 1) au lieu de ((a < b) ? 1 : -1)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// si le problème viens du fait du format des dates const parseDates = [...dates].map((date) => Date.parse(date))
      // const antiChrono = (a, b) => (a < b ? -1 : 1)
      // const parseDatesSorted = [...parseDates].sort(antiChrono)
      // expect(parseDates).toEqual(parseDatesSorted)