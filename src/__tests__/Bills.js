/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router.js'
import Bills from '../containers/Bills.js'

jest.mock('../app/store', () => mockStore)

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee'
    })
  )
})

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList[0]).toBe('active-icon')
    })
    test('Then bills should be ordered from earliest to latest', async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on Bills page but it is loading', () => {
    test('Then I should land on a loading page', () => {
      const html = BillsUI({ data: [], loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then I should land on an error page', () => {
      const html = BillsUI({ data: [], loading: false, error: 'Oops!' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe('When I click on new bill button', () => {
    test('Then I should be send on the new bill page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills, loading: false })
      const newBillButton = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill())
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
  describe('When I click on eye icon', () => {
    test('Then it should open the bill modal with corresponding content', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
      const iconEye = screen.getAllByTestId('icon-eye')
      const eye = iconEye[0]
      userEvent.click(eye)
      const modale = screen.getByTestId('modaleFile')
      const billUrl = eye.getAttribute('data-bill-url').split('?')[0]
      expect(modale.innerHTML).toContain(billUrl)
      expect(modale).toBeTruthy()
      expect($.fn.modal).toHaveBeenCalled()
    })
  })
})

// test d'intégration GET
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bill', () => {
    test("fetches Employee's bill from mock API GET", async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      const transportBill = screen.getByText('Transports')
      expect(transportBill).toBeTruthy()
    })
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills')
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a'
          })
        )
        const root = document.createElement('div')
        root.setAttribute('id', 'root')
        document.body.appendChild(root)
        router()
      })
      test('fetches bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test('fetches messages from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
