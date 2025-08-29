import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";

// Interface para erros de API
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      statusCode?: number;
    };
  };
  message?: string;
}

export const handleAuthError = async (error: ApiError) => {
  if (error?.response?.status === 401) {
    await auth.signOut();
    window.location.href = "/login";
  }
  
  // Verifica se é um erro de "Not Found" (404)
  const isNotFound = 
    error?.response?.status === 404 ||
    error?.response?.data?.statusCode === 404;

  // Se for um erro 404, apenas loga o erro e não redireciona
  if (isNotFound) {
    console.error("Recurso não encontrado:", error);
    return;
  }
  
  // Para outros erros, apenas loga
  console.error("Erro na requisição:", error);
}; 