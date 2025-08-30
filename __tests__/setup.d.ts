import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveStyle(style: object): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
    }
  }
}

export {}
