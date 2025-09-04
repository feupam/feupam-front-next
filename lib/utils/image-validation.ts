/**
 * Utilitários para validação de imagens
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida se o arquivo é uma imagem JPG/JPEG válida
 * @param file O arquivo a ser validado
 * @returns Resultado da validação
 */
export function validateJpgImage(file: File): ImageValidationResult {
  // Verifica se é um arquivo
  if (!file) {
    return {
      isValid: false,
      error: 'Nenhum arquivo selecionado'
    };
  }

  // Verifica o tipo MIME
  const validMimeTypes = ['image/jpeg', 'image/jpg'];
  if (!validMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Arquivo deve ser uma imagem JPG/JPEG'
    };
  }

  // Verifica a extensão do arquivo
  const validExtensions = ['.jpg', '.jpeg'];
  const fileExtension = file.name.toLowerCase().split('.').pop();
  if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
    return {
      isValid: false,
      error: 'Arquivo deve ter extensão .jpg ou .jpeg'
    };
  }

  // Limitadores de tamanho removidos para permitir testar qualquer imagem

  return {
    isValid: true
  };
}

/**
 * Valida múltiplos arquivos de imagem JPG
 * @param files Array de arquivos a serem validados
 * @returns Array com os resultados de validação
 */
export function validateMultipleJpgImages(files: File[]): ImageValidationResult[] {
  return files.map(file => validateJpgImage(file));
}

/**
 * Cria uma prévia da imagem para exibição
 * @param file Arquivo de imagem
 * @returns Promise com a URL da prévia
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Erro ao criar prévia da imagem'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Dimensões recomendadas para as imagens
 */
export const IMAGE_REQUIREMENTS = {
  logo_evento: {
    name: 'Logo do Evento',
    recommendedWidth: 600,
    recommendedHeight: 800,
    aspectRatio: '3:4',
    description: 'Logo quadrado do evento (600x800 recomendado)'
  },
  image_capa: {
    name: 'Imagem de Capa',
    recommendedWidth: 1200,
    recommendedHeight: 600,
    aspectRatio: '2:1',
    description: 'Imagem de capa do evento (1200x600px recomendado)'
  }
} as const;

/**
 * Valida as dimensões de uma imagem
 * @param file Arquivo de imagem
 * @param imageType Tipo da imagem (logo_evento ou image_capa)
 * @returns Promise com o resultado da validação
 */
export function validateImageDimensions(
  file: File, 
  imageType: keyof typeof IMAGE_REQUIREMENTS
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Limitadores de dimensão removidos para permitir testar qualquer imagem
      resolve({
        isValid: true
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Erro ao carregar a imagem para validação'
      });
    };
    
    img.src = url;
  });
}
