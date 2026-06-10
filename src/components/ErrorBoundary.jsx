import React from 'react';

/* Captura excepciones de render para que un crash no deje la app en blanco.
   Sin esto, cualquier error lanzado durante el render desmonta todo el árbol
   de React y solo queda el fondo. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log para diagnóstico en consola / herramientas del navegador.
    console.error('ErrorBoundary capturó un error de render:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div className="glass empty" style={{ padding: 48, maxWidth: 440, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>Algo salió mal</h3>
            <p style={{ color: 'var(--slate-400)', margin: '0 0 20px', fontSize: 14 }}>
              Ocurrió un error inesperado. Recarga la página para continuar.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
