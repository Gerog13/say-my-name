import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[Say My Name] error:', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-shell items-center justify-center text-center">
          <div className="panel">
            <p className="text-5xl">💥</p>
            <h1 className="mt-3 font-display text-2xl font-extrabold">Algo se rompió</h1>
            <p className="mt-2 text-white/60">{this.state.message}</p>
            <button
              className="btn-primary mt-4"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
