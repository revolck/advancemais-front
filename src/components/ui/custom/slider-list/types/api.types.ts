/**
 * Interface para dados do slider vindos da API (Backend)
 */
export interface SliderBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Interface para dados do slider no frontend
 */
export interface SliderItem {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  ordem: number;
  criadoEm: Date;
  atualizadoEm: Date;
  isPublished?: boolean;
}

/**
 * Interface para criação/edição de slider
 */
export interface SliderFormData {
  imagemUrl?: string;
  link?: string;
  ordem: number;
  imagem?: File;
}

/**
 * Interface para resposta padronizada da API
 */
export interface SliderApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Interface para parâmetros de reordenação
 */
export interface ReorderParams {
  id: string;
  ordem: number;
}
