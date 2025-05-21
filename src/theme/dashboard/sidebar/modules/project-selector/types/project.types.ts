/**
 * Tipo que representa um projeto/tenant no sistema
 */
export interface Project {
  /** Identificador único do projeto */
  id: string;

  /** Nome do projeto/tenant */
  name: string;

  /** URL do logotipo do projeto (opcional) */
  logoUrl?: string;

  /** Data de criação do projeto */
  createdAt: Date;
}
