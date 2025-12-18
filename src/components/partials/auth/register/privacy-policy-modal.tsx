import type { ReactNode } from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
  Shield,
} from "lucide-react";

export type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const sections: Array<{
  title: string;
  content: ReactNode[];
}> = [
  {
    title: "Quais dados coletamos",
    content: [
      "Conta e cadastro: para usar nossos serviços, coletamos nome ou razão social, CPF ou CNPJ, data de nascimento, e-mail, telefones, endereço, senha (criptografada) e seu perfil na plataforma (Empresa, Candidato, Aluno, Instrutor ou Profissional de Psicologia/Pedagógico).",
      "Dados acadêmicos e de cursos: para alunos e instrutores, coletamos informações sobre turmas, presença, notas e avaliações, certificados emitidos, além de interações em fóruns e suporte.",
      "Recrutamento e seleção: para candidatos e empresas, coletamos currículo, experiências profissionais, formações acadêmicas, dados de candidaturas, mensagens trocadas e agendamentos de entrevistas.",
      "Faturamento e contratação: quando você contrata planos ou assinaturas, coletamos informações sobre o plano escolhido, dados do meio de pagamento (apenas identificadores seguros), notas fiscais e informações de cobrança necessárias para o processo.",
      "Suporte e comunicação: registramos tickets de atendimento, conversas de suporte, suas preferências de comunicação e consentimentos fornecidos.",
      "Dados técnicos e cookies: coletamos seu endereço IP, data e hora de acesso, tipo de dispositivo e navegador, páginas visitadas, identificadores de sessão e cookies (essenciais, funcionais, analíticos e de publicidade). Você pode gerenciar suas preferências de cookies através do banner disponível no rodapé.",
      "Dados sensíveis: informações de saúde ou avaliações psicológicas/pedagógicas são coletadas apenas quando necessárias para a prestação de serviços por profissionais habilitados, com base legal adequada (como consentimento específico) e controles de segurança reforçados.",
    ],
  },
  {
    title: "Para que usamos seus dados",
    content: [
      "Execução de contrato: usamos seus dados para criar e manter sua conta, inscrevê-lo em cursos, emitir certificados, permitir candidaturas a vagas, facilitar o contato entre empresas e candidatos, e gerenciar assinaturas e planos contratados.",
      "Cumprimento de obrigações legais: utilizamos seus dados para emitir notas fiscais, manter registros de acesso conforme exigido pelo Marco Civil da Internet, e responder a solicitações de autoridades competentes.",
      "Interesses legítimos: com o objetivo de proteger você e melhorar nossos serviços, usamos dados para prevenir fraudes e incidentes de segurança, melhorar a usabilidade da plataforma, analisar métricas de navegação e desempenho, e enviar comunicações operacionais importantes. Você pode optar por não receber algumas dessas comunicações.",
      "Com seu consentimento: enviamos comunicações de marketing, utilizamos cookies não essenciais, tratamos dados sensíveis relacionados a serviços de psicologia ou pedagógicos quando necessário, e convidamos para participação em pesquisas. Você pode revogar seu consentimento a qualquer momento através dos canais indicados.",
      "Proteção do crédito e direitos: utilizamos dados mínimos necessários para processos de cobrança, defesa em processos judiciais e cumprimento de contratos firmados.",
    ],
  },
  {
    title: "Cookies, identificadores e analytics",
    content: [
      "Utilizamos cookies e tecnologias similares para garantir o funcionamento da sua conta, melhorar a segurança, gerar estatísticas de uso e personalizar sua experiência na plataforma. Você pode gerenciar suas preferências de cookies através do link disponível no rodapé da plataforma.",
      "Seguimos as boas práticas recomendadas pela Autoridade Nacional de Proteção de Dados (ANPD) para garantir transparência, permitir que você escolha quais cookies aceita, e manter registros claros de suas escolhas.",
    ],
  },
  {
    title: "Com quem compartilhamos dados",
    content: [
      "Operadores e parceiros: compartilhamos dados com provedores de serviços em nuvem, serviços de e-mail e entrega de mensagens, sistemas antifraude, ferramentas de análise, serviços de emissão fiscal e processadores de pagamento. Esses parceiros utilizam os dados exclusivamente para cumprir as finalidades que informamos aqui.",
      "Empresas e candidatos: quando você se candidata a uma vaga ou interage com uma empresa, compartilhamos seus dados de candidatura e currículo com a empresa responsável pela vaga.",
      "Autoridades públicas: podemos compartilhar dados quando houver requisição legal, ordem judicial ou quando necessário para proteger direitos da ADVANCE+ e de terceiros, sempre nos termos da legislação aplicável.",
      "Transferências internacionais: alguns de nossos provedores de serviços podem estar localizados fora do Brasil. Quando isso ocorrer, adotamos medidas de segurança contratuais e técnicas previstas na LGPD para proteger seus dados.",
    ],
  },
  {
    title: "Segurança da informação",
    content: [
      "Aplicamos medidas de segurança técnicas e administrativas para proteger seus dados: utilizamos criptografia para dados em trânsito, controles de acesso baseados em perfis de usuário, registro de eventos importantes, backups regulares e testes periódicos de segurança. Embora nenhuma plataforma seja 100% imune a riscos, recomendamos que você use senhas fortes e ative a autenticação de dois fatores sempre que disponível.",
    ],
  },
  {
    title: "Retenção e descarte",
    content: [
      "Conta e histórico: mantemos seus dados enquanto sua conta estiver ativa ou enquanto forem necessários para as finalidades informadas nesta Política.",
      "Registros de acesso: conforme exigido pelo Marco Civil da Internet, mantemos registros de acesso às aplicações por no mínimo 6 meses.",
      "Dados fiscais e contábeis: guardamos informações de faturamento e contábeis pelos prazos estabelecidos pela legislação fiscal e contábil aplicável.",
      "Processos seletivos: dados de candidaturas podem ser mantidos por um período compatível com o ciclo de recrutamento e obrigações legais, ou até que você revogue seu consentimento, quando aplicável.",
      "Dados sensíveis: informações sensíveis são conservadas apenas pelo tempo estritamente necessário para a prestação do serviço, com controles de segurança reforçados.",
    ],
  },
  {
    title: "Seus direitos",
    content: [
      "Você tem direito a solicitar, a qualquer momento: confirmação de que tratamos seus dados, acesso aos dados que temos sobre você, correção de dados incorretos ou desatualizados, anonimização de dados, portabilidade dos seus dados, informações sobre com quem compartilhamos seus dados, revogação de consentimentos fornecidos e eliminação dos seus dados, sempre nos termos da LGPD.",
      <>
        Para exercer qualquer um desses direitos, entre em contato com o
        Encarregado de Proteção de Dados (DPO) através do e-mail indicado abaixo
        ou utilize as páginas de{" "}
        <a
          href="https://advancemais.com/ouvidoria"
          target="_blank"
          rel="noreferrer"
          className="!text-primary underline-offset-4 hover:underline"
        >
          Ouvidoria
        </a>{" "}
        e{" "}
        <a
          href="https://advancemais.com/faq"
          target="_blank"
          rel="noreferrer"
          className="!text-primary underline-offset-4 hover:underline"
        >
          FAQ
        </a>
        .
      </>,
    ],
  },
  {
    title: "Crianças e adolescentes",
    content: [
      "Nossa plataforma é voltada ao público geral e recomendada para maiores de 18 anos. Quando oferecemos serviços educacionais para menores de idade, exigimos o consentimento do responsável legal e seguimos rigorosamente o Estatuto da Criança e do Adolescente (ECA) e a Lei Geral de Proteção de Dados (LGPD).",
    ],
  },
  {
    title: "Links de terceiros",
    content: [
      "Nossa plataforma pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade desses sites. Recomendamos que você leia as políticas de privacidade desses sites antes de fornecer qualquer informação pessoal.",
    ],
  },
  {
    title: "Atualizações desta Política",
    content: [
      "Podemos atualizar esta Política de Privacidade para refletir mudanças na legislação ou em nossas operações. Sempre publicaremos a versão atualizada nesta página. Quando houver mudanças relevantes, podemos notificar usuários cadastrados através dos canais de comunicação informados.",
    ],
  },
  {
    title: "Como entrar em contato",
    content: [
      "Encarregado de Proteção de Dados (DPO): contato@advancemais.com",
      <>
        Ouvidoria e FAQ:{" "}
        <a
          href="https://advancemais.com/ouvidoria"
          target="_blank"
          rel="noreferrer"
          className="!text-primary underline-offset-4 hover:underline"
        >
          advancemais.com/ouvidoria
        </a>{" "}
        ·{" "}
        <a
          href="https://advancemais.com/faq"
          target="_blank"
          rel="noreferrer"
          className="!text-primary underline-offset-4 hover:underline"
        >
          advancemais.com/faq
        </a>
      </>,
      "Telefones: (82) 3234-1397 | (82) 98882-5559",
      "Endereço: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
    ],
  },
  {
    title: "Nota jurídica",
    content: [
      "Este documento foi elaborado seguindo as diretrizes da Lei Geral de Proteção de Dados (LGPD) e as boas práticas recomendadas pela Autoridade Nacional de Proteção de Dados (ANPD), incluindo questões relacionadas a cookies e ao Encarregado de Proteção de Dados. Também consideramos as obrigações do Marco Civil da Internet para registros de acesso e transparência. Quando houver relação de consumo online, este documento convive com as obrigações do Código de Defesa do Consumidor (CDC) e do Decreto 7.962/2013. Recomendamos que empresas revisem este documento com assessoria jurídica para adequação às suas particularidades.",
    ],
  },
];

const PrivacyPolicyModal = ({
  isOpen,
  onOpenChange,
}: PrivacyPolicyModalProps) => {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className="max-h-[90dvh] flex flex-col">
        <ModalHeader className="sticky top-0 z-10 border-b border-gray-200 pb-4 -mx-6 px-6 -mt-6 pt-6 pr-12">
          <ModalTitle className="mb-0!">Política de Privacidade</ModalTitle>
          <ModalDescription className="!text-sm !text-muted-foreground !mb-0">
            Vigência: 23/09/2025 · Última atualização: 23/09/2025
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex-1 space-y-6 overflow-y-auto pr-2 !text-sm !leading-relaxed !text-muted-foreground min-h-0 mt-8">
          {/* Informações da Empresa */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">
                  Controladora/Operadora:
                </strong>{" "}
                ADVANCE+ CURSOS E TREINAMENTOS LTDA – ME
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">CNPJ:</strong>{" "}
                25.089.257/0001-92
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Endereço:</strong> Av. Juca
                Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa,
                CEP 57.042-530, Maceió/AL
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Telefones:</strong> (82)
                3234-1397 | (82) 98882-5559
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">
                  Horário de atendimento:
                </strong>{" "}
                seg–sex 08h–20h, sáb 09h–13h
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">E-mail do DPO:</strong>{" "}
                <a
                  href="mailto:contato@advancemais.com"
                  className="!text-primary hover:underline"
                >
                  contato@advancemais.com
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-0! flex-1">
                <strong className="!text-foreground">Ouvidoria/FAQ:</strong>{" "}
                <a
                  href="https://advancemais.com/ouvidoria"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="!text-primary underline-offset-4 hover:underline"
                >
                  advancemais.com/ouvidoria
                </a>
                {" · "}
                <a
                  href="https://advancemais.com/faq"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="!text-primary underline-offset-4 hover:underline"
                >
                  advancemais.com/faq
                </a>
              </p>
            </div>
            <p>
              Esta Política explica como tratamos dados pessoais de Empresas,
              Candidatos, Alunos, Instrutores, Profissionais de
              Psicologia/Pedagógico e demais Usuários, conforme a LGPD. Ao usar
              a Plataforma, você concorda com esta Política.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <section key={section.title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h2 className="!font-semibold !text-base !text-foreground !mb-0">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {section.content
                    .filter((item) => {
                      if (typeof item === "string") {
                        const trimmed = item.trim();
                        return (
                          ![
                            "Advance+",
                            "Planalto",
                            "+1",
                            "Serviços e Informações do Brasil",
                          ].includes(trimmed) && trimmed.length > 0
                        );
                      }
                      return true; // Mantém ReactNode (JSX)
                    })
                    .map((paragraph, contentIndex) => (
                      <p
                        key={`${section.title}-${contentIndex}`}
                        className="!leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </ModalBody>

        <ModalFooter className="sticky bottom-0 z-10 border-t border-gray-200 pt-4 -mx-6 px-6">
          <div className="flex items-center justify-end gap-3 w-full">
            <ButtonCustom
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </ButtonCustom>
            <ButtonCustom
              type="button"
              variant="primary"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Entendi
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};

export default PrivacyPolicyModal;
