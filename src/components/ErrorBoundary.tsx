import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou erro em ' + (this.props.moduleName || 'componente') + ':', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-[300px] rounded-xl border border-red-200 dark:border-red-900/40 m-4 shadow-sm">
          <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Falha temporária ao carregar {this.props.moduleName || 'esta seção'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center mb-6">
            Ocorreu um erro inesperado ao processar os dados desta tela. Seus dados estão preservados no armazenamento seguro.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-all text-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar Módulo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all text-sm cursor-pointer"
            >
              Atualizar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
