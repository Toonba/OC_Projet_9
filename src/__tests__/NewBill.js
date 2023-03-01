/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router.js'
import userEvent from '@testing-library/user-event'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  describe('When I am on New Bills Page', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    test('Then new bill icon in vertical layout should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList[0]).toBe('active-icon')
    })
    describe('When a file is selected through file input', () => {
      test('Then selecting image files (.jpg, .jpeg, .png) should work and no alert is displayed', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const employeeNewBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        jest.spyOn(window, 'alert').mockImplementation(() => {})
        const fileInput = screen.getByTestId('file')

        const handleChangeFile = jest.fn(employeeNewBill.handleChangeFile)
        fileInput.addEventListener('change', (e) => handleChangeFile(e))
        const file = new File(['test'], 'test.png', { type: 'image/png' })
        userEvent.upload(fileInput, file)
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()
        expect(fileInput.files[0]).toStrictEqual(file)
      })
      test('Then selecting wrong files should display an alerte', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        const inputFile = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        inputFile.addEventListener('change', (e) => handleChangeFile(e))
        const file = new File(['text'], 'text.txt', { type: 'text/plain' })
        userEvent.upload(inputFile, file)
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalled
        expect(inputFile.value.length).toBe(0)
      })
    })
  })
  describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page and I submit the form width an image (jpg, jpeg, png)', () => {
      test('Then it should create a new bill', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee'
          })
        )
        document.body.innerHTML = NewBillUI()

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const submitBtn = screen.getByTestId('form-new-bill')
        submitBtn.addEventListener('submit', handleSubmit)
        fireEvent.submit(submitBtn)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

// Test d'intégration POST
describe('Given I am a user connected as Employee', () => {
  describe('When I submit the form completed', () => {
    test('Then the bill is created', async () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      )

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      const validBill = {
        type: 'Restaurants et bars',
        name: 'Vol Paris Londres',
        date: '2022-02-15',
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: 'Commentary',
        fileUrl: '../img/0.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }

      // Load the values in fields
      screen.getByTestId('expense-type').value = validBill.type
      screen.getByTestId('expense-name').value = validBill.name
      screen.getByTestId('datepicker').value = validBill.date
      screen.getByTestId('amount').value = validBill.amount
      screen.getByTestId('vat').value = validBill.vat
      screen.getByTestId('pct').value = validBill.pct
      screen.getByTestId('commentary').value = validBill.commentary

      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl

      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    })
    test('fetches error from an API and fails with 500 error', async () => {
      jest.spyOn(mockStore, 'bills')
      jest.spyOn(console, 'error').mockImplementation(() => {}) // Prevent Console.error jest error

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      // Submit form
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })
})
