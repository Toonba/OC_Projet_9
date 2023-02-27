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
describe('When a valid bill is submitted', () => {
  test('Then a new bill is generated', async () => {
    const storeSpy = jest.spyOn(mockStore, 'bills')

    const newBill = {
      id: 'X2w33aqa96e6s2v2696z6f2',
      vat: '80',
      fileUrl: 'https://www.parisinfo.com/var/otcp/sites/images/media/1.-photos/03.-hebergement-630-x-405/hotel-enseigne-neon-630x405-c-thinkstock/31513-1-fre-FR/Hotel-enseigne-neon-630x405-C-Thinkstock.jpg',
      status: 'pending',
      type: 'Hôtel et logement',
      commentary: 'Hotel Paris Info',
      name: 'encore',
      fileName: 'preview-parisinfo-free-201801-pdf-1.jpg',
      date: '2023-04-04',
      amount: 800,
      commentAdmin: 'ok',
      email: 'montest@gmail.com',
      pct: 20
    }

    await mockStore.bills().create(newBill)

    expect(storeSpy).toHaveBeenCalledTimes(1)
  })
})
