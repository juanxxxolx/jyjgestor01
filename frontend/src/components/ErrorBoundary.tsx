/**
 * @fileoverview Error boundary de React que captura errores no controlados
 * y muestra una pantalla de error con opción de recargar.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

/** Componente que captura errores de renderizado y muestra una interfaz de recuperación. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no capturado:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Algo salió mal"
          subTitle={this.state.error?.message || 'Ocurrió un error inesperado'}
          extra={
            <Button type="primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
              Recargar página
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
