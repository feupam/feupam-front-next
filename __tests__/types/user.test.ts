import { describe, it, expect } from 'vitest'
import { UserProfile, UserFormFields, FormSection, formSections, userFormFields } from '@/types/user'

describe('User Types', () => {
  describe('UserProfile Interface', () => {
    it('should validate user profile structure', () => {
      const mockUserProfile: UserProfile = {
        userType: 'client',
        name: 'João Silva',
        email: 'joao@example.com',
        church: 'Igreja Central',
        pastor: 'Pastor Pedro',
        ddd: '11',
        cellphone: '99999-9999',
        gender: 'male',
        cep: '01234-567',
        cpf: '123.456.789-00',
        data_nasc: '1990-01-01',
        idade: 34,
        responsavel: '',
        documento_responsavel: '',
        ddd_responsavel: '',
        cellphone_responsavel: '',
        address: 'Rua das Flores, 123',
        complemento: '',
        cidade: 'São Paulo',
        estado: 'SP',
        alergia: 'Não',
        medicamento: 'Não',
        info_add: '',
        lgpdConsentAccepted: false,
        wantShirt: false,
        isStaff: false,
        staffPassword: '',
        photoURL: undefined,
        city: '',
        number: '',
        neighborhood: '',
        state: ''
      }

      expect(mockUserProfile.userType).toBe('client')
      expect(mockUserProfile.name).toBe('João Silva')
      expect(mockUserProfile.email).toBe('joao@example.com')
      expect(mockUserProfile.gender).toBe('male')
      expect(mockUserProfile.idade).toBe(34)
    })

    it('should support staff user type', () => {
      const staffUser: UserProfile['userType'] = 'staff'
      expect(staffUser).toBe('staff')
    })

    it('should support female gender', () => {
      const femaleUser: UserProfile['gender'] = 'female'
      expect(femaleUser).toBe('female')
    })
  })

  describe('UserFormFields', () => {
    it('should validate form field structure', () => {
      const mockField: UserFormFields = {
        label: 'Nome Completo',
        name: 'name',
        type: 'text',
        required: true,
        placeholder: 'Digite seu nome'
      }

      expect(mockField.label).toBe('Nome Completo')
      expect(mockField.name).toBe('name')
      expect(mockField.type).toBe('text')
      expect(mockField.required).toBe(true)
    })

    it('should support different field types', () => {
      const textField: UserFormFields['type'] = 'text'
      const selectField: UserFormFields['type'] = 'select'
      const dateField: UserFormFields['type'] = 'date'
      const numberField: UserFormFields['type'] = 'number'
      const telField: UserFormFields['type'] = 'tel'
      const textareaField: UserFormFields['type'] = 'textarea'
      const radioField: UserFormFields['type'] = 'radio'

      expect([textField, selectField, dateField, numberField, telField, textareaField, radioField])
        .toEqual(['text', 'select', 'date', 'number', 'tel', 'textarea', 'radio'])
    })
  })

  describe('FormSection', () => {
    it('should validate form section structure', () => {
      const mockSection: FormSection = {
        title: 'Informações Pessoais',
        fields: [
          {
            label: 'Nome',
            name: 'name',
            type: 'text',
            required: true
          }
        ]
      }

      expect(mockSection.title).toBe('Informações Pessoais')
      expect(mockSection.fields).toHaveLength(1)
      expect(mockSection.fields[0].name).toBe('name')
    })
  })

  describe('formSections Configuration', () => {
    it('should have valid form sections', () => {
      expect(formSections).toBeDefined()
      expect(Array.isArray(formSections)).toBe(true)
      expect(formSections.length).toBeGreaterThan(0)
    })

    it('should have sections with titles and fields', () => {
      formSections.forEach(section => {
        expect(section.title).toBeDefined()
        expect(typeof section.title).toBe('string')
        expect(Array.isArray(section.fields)).toBe(true)
        expect(section.fields.length).toBeGreaterThan(0)
      })
    })

    it('should have valid field configurations', () => {
      const allFields = formSections.flatMap(section => section.fields)
      
      allFields.forEach(field => {
        expect(field.label).toBeDefined()
        expect(field.name).toBeDefined()
        expect(field.type).toBeDefined()
        expect(typeof field.required).toBe('boolean')
      })
    })
  })

  describe('userFormFields Compatibility', () => {
    it('should be a flattened array of all fields', () => {
      const expectedFields = formSections.flatMap(section => section.fields)
      
      expect(userFormFields).toEqual(expectedFields)
      expect(userFormFields.length).toBe(expectedFields.length)
    })

    it('should contain name field', () => {
      const nameField = userFormFields.find(field => field.name === 'name')
      expect(nameField).toBeDefined()
      expect(nameField?.label).toContain('Nome')
    })

    it('should contain church field', () => {
      const churchField = userFormFields.find(field => field.name === 'church')
      expect(churchField).toBeDefined()
      expect(churchField?.type).toBe('text')
      expect(churchField?.label).toBe('Igreja')
    })
  })
})
