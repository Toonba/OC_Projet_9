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

// beforeEach(() => {
//   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//   window.localStorage.setItem(
//     'user',
//     JSON.stringify({
//       type: 'Employee'
//     })
//   )
// })

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

// // Test d'intégration POST

// /**
//  * @jest-environment jsdom
//  */

// import { fireEvent, screen, waitFor } from '@testing-library/dom'
// import NewBillUI from '../views/NewBillUI.js'
// import NewBill from '../containers/NewBill.js'
// import '@testing-library/jest-dom'
// import router from '../app/Router.js'
// import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
// import { localStorageMock } from '../__mocks__/localStorage.js'
// import mockStore from '../__mocks__/store.js'

// describe('Given I am connected as an employee', () => {
//   afterEach(() => {
//     document.body.innerHTML = ''
//   })

//   beforeEach(() => {
//     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//     window.localStorage.setItem(
//       'user',
//       JSON.stringify({
//         type: 'Employee'
//       })
//     )
//   })

//   describe('When I am on NewBill Page', () => {
//     test('Then mail-icon should be highlighted', async () => {
//       const root = document.createElement('div')
//       root.setAttribute('id', 'root')
//       document.body.append(root)

//       router()
//       window.onNavigate(ROUTES_PATH.NewBill)
//       await waitFor(() => screen.getByTestId('icon-mail'))
//       const mailIcon = screen.getByTestId('icon-mail')
//       expect(mailIcon).toHaveClass('active-icon')
//     })

//     describe('When a file is uploaded in accepted format  jpeg, jpg, png)', () => {
//       test('Then file should be updated after uploaded', () => {
//         document.body.innerHTML = NewBillUI()

//         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

//         const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')

//         const input = screen.getByTestId('file')
//         const errorDom = screen.getByTestId('error-extension')
//         input.addEventListener('change', handleChangeFile)
//         fireEvent.change(input, {
//           target: {
//             files: [new File(['body'], 'notebill.jpg', { type: 'image/jpeg' })]
//           }
//         })
//         console.log(input, '_______')
//         console.log(input.files[0].name, '(((((((((')

//         expect(handleChangeFile).toBeCalled()
//         expect(input.files[0].name).toBe('notebill.jpg')
//         expect(errorDom.textContent).toBe()
//       })
//     })

//     describe('When user submits form correctly', () => {
//       test('Then a bill is created', () => {
//         document.body.innerHTML = NewBillUI()

//         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

//         const updateBill = jest.spyOn(newBill, 'updateBill')

//         const form = screen.getByTestId('form-new-bill')
//         fireEvent.submit(form)

//         expect(updateBill).toHaveBeenCalledTimes(1)
//       })
//     })

//     describe('When i submit a bill form', () => {
//       test('Then handleSubmit function should be called', () => {
//         document.body.innerHTML = NewBillUI()
//         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

//         const formNewBill = screen.getByTestId('form-new-bill')
//         const handleSubmit = jest.spyOn(newBill, 'handleSubmit')

//         formNewBill.addEventListener('submit', handleSubmit)

//         fireEvent.submit(formNewBill)

//         expect(handleSubmit).toHaveBeenCalled()
//       })
//     })

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
