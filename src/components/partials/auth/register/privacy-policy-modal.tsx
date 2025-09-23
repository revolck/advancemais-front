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

export type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const sections: Array<{
  title: string;
  content: ReactNode[];
}> = [
  {
    title: "1. Quais dados coletamos",
    content: [
      "1.1 Conta e cadastro (obrigatórios para uso de serviços): nome/razão social, CPF/CNPJ, data de nascimento, e-mail, telefones, endereço, senha (hash), papel na plataforma (Empresa, Candidato, Aluno, Professor, Psicologia/Pedagógico).",
      "Advance+",
      "1.2 Dados acadêmicos e de cursos (Alunos/Professores): turmas, presença, notas/avaliações, certificados, interações em fóruns e suporte.",
      "1.3 Recrutamento e seleção (Candidatos/Empresas): currículo, experiências, formações, dados de candidatura, mensagens e agendamentos de entrevistas.",
      "1.4 Faturamento e contratação (quando aplicável): plano/assinatura, meios de pagamento (tokens/identificadores do provedor), notas fiscais e dados de cobrança (limitados ao necessário).",
      "1.5 Suporte e comunicação: tickets, gravação de interações textuais, preferências e consentimentos.",
      "1.6 Dados técnicos e cookies: IP, data/hora, dispositivo, navegador, páginas acessadas, identificadores de sessão, cookies essenciais/funcionais/analíticos/publicidade, conforme banner de Preferências de Cookies.",
      "Advance+",
      "+1",
      "1.7 Dados sensíveis (tratamento restrito): informações de saúde/avaliação psicológica/pedagógica eventualmente necessárias à prestação de serviços por profissionais habilitados somente com base legal adequada (ex.: consentimento específico e informado) e controles reforçados.",
      "Planalto",
    ],
  },
  {
    title: "2. Para que usamos seus dados (finalidades e bases legais da LGPD)",
    content: [
      "2.1 Execução de contrato e procedimentos preliminares:",
      "• criar e manter sua conta; matricular em cursos; emitir certificados; permitir candidaturas e contato Empresa↔Candidato; operacionalizar assinaturas/planos. (Base: execução de contrato/ procedimento preliminar).",
      "Planalto",
      "2.2 Cumprimento de obrigação legal/regulatória:",
      "• emissão fiscal; guarda de registros de acesso (Marco Civil); respostas a autoridades. (Base: obrigação legal).",
      "Planalto",
      "2.3 Interesses legítimos (sempre com ponderação e opt-out quando cabível):",
      "• segurança antifraude e prevenção a incidentes; melhoria de usabilidade; métricas de navegação e desempenho; comunicação operacional. (Base: legítimo interesse).",
      "Planalto",
      "2.4 Consentimento:",
      "• envio de comunicações de marketing; uso de cookies não essenciais; tratamento de dados sensíveis vinculados a serviços de psicologia/pedagógico quando exigido; participação em pesquisas. Consentimentos podem ser revogados a qualquer tempo nos canais indicados. (Base: consentimento).",
      "Serviços e Informações do Brasil",
      "+1",
      "2.5 Proteção do crédito e exercício regular de direitos:",
      "• tratamento mínimo para cobrança, defesa em processos e cumprimento de contratos. (Bases: proteção do crédito; exercício regular de direitos).",
      "Planalto",
    ],
  },
  {
    title: "3. Cookies, identificadores e analytics",
    content: [
      "3.1 Usamos cookies e tecnologias similares para funcionamento da conta, segurança, estatísticas e personalização. Você pode gerenciar preferências pelo nosso link de Preferências de Cookies no rodapé.",
      "Advance+",
      "3.2 Seguimos as boas práticas da ANPD para transparência, granularidade de consentimento e evidências de opt-in/opt-out.",
      "Serviços e Informações do Brasil",
      "+1",
    ],
  },
  {
    title: "4. Com quem compartilhamos dados",
    content: [
      "4.1 Operadores e parceiros: provedores de nuvem/infra, e-mail/entrega de mensagens, antifraude, analytics, emissão fiscal e meios de pagamento — exclusivamente para cumprir as finalidades informadas.",
      "4.2 Empresas e Candidatos: dados de candidatura/currículo são compartilhados quando você se aplica a uma vaga ou interage com a Empresa.",
      "4.3 Autoridades públicas: mediante requisição legal, ordem judicial ou para resguardar direitos da ADVANCE+ e de terceiros, nos termos da lei.",
      "4.4 Transferências internacionais: podem ocorrer quando nossos provedores estiverem fora do Brasil; adotamos salvaguardas contratuais e técnicas previstas na LGPD (arts. 33–36).",
      "Planalto",
    ],
  },
  {
    title: "5. Segurança da informação",
    content: [
      "Aplicamos medidas técnicas e administrativas proporcionais ao risco: criptografia em trânsito, controles de acesso por perfil, registro de eventos, backups e testes periódicos. Nenhuma plataforma é 100% imune; por isso, também orientamos o uso de senhas fortes e autenticação adicional sempre que disponível.",
    ],
  },
  {
    title: "6. Retenção e descarte",
    content: [
      "6.1 Conta e histórico: mantidos enquanto a conta estiver ativa e/ou necessários para as finalidades informadas.",
      "6.2 Registros de acesso a aplicações (Marco Civil): mantidos por no mínimo 6 meses.",
      "Planalto",
      "6.3 Faturamento/contábil: guardados pelos prazos legais aplicáveis.",
      "6.4 Processos seletivos: dados de candidaturas podem ser retidos por período compatível ao ciclo de recrutamento e obrigações legais (ou até revogação do consentimento, quando aplicável).",
      "6.5 Dados sensíveis: conservados apenas pelo tempo estritamente necessário e com controles reforçados.",
    ],
  },
  {
    title: "7. Direitos do titular",
    content: [
      "Você pode solicitar, a qualquer momento: confirmação do tratamento, acesso, correção, anonimização, portabilidade, informação sobre compartilhamentos, revogação de consentimento e eliminação nos termos da LGPD.",
      (
        <>
          Para exercer seus direitos, contate o Encarregado (DPO) no e-mail
          indicado abaixo ou utilize as páginas de{" "}
          <a
            href="https://advancemais.com/ouvidoria"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Ouvidoria
          </a>{" "}e{" "}
          <a
            href="https://advancemais.com/faq"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            FAQ
          </a>
          .
        </>
      ),
      "Planalto",
    ],
  },
  {
    title: "8. Crianças e adolescentes",
    content: [
      "A Plataforma é voltada ao público geral e recomendada para maiores de 18 anos. Serviços educacionais para menores (quando oferecidos) exigem consentimento do responsável e observância ao ECA e à LGPD.",
      "Planalto",
    ],
  },
  {
    title: "9. Links de terceiros",
    content: [
      "Podemos conter links para sites externos. Não nos responsabilizamos por suas práticas de privacidade. Recomendamos ler as respectivas políticas antes de fornecer dados.",
    ],
  },
  {
    title: "10. Atualizações desta Política",
    content: [
      "Podemos alterar esta Política para refletir mudanças legais ou operacionais. Publicaremos a versão vigente nesta página e, quando mudanças relevantes ocorrerem, poderemos notificar Usuários cadastrados pelos canais informados.",
    ],
  },
  {
    title: "11. Como falar com a ADVANCE+ sobre dados pessoais",
    content: [
      "Encarregado (DPO): [Nome do DPO]",
      "E-mail do DPO: [email@advancemais.com]",
      (
        <>
          Ouvidoria/FAQ:{" "}
          <a
            href="https://advancemais.com/ouvidoria"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            advancemais.com/ouvidoria
          </a>{" "}·{" "}
          <a
            href="https://advancemais.com/faq"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            advancemais.com/faq
          </a>
        </>
      ),
      "Telefones: (82) 3234-1397 | (82) 98882-5559",
      "Endereço: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
      "Advance+",
    ],
  },
  {
    title: "Nota jurídica",
    content: [
      "Este documento atende às diretrizes da LGPD e boas práticas da ANPD (Cookies/Encarregado), além de considerar obrigações do Marco Civil para registros de acesso e transparência; pode conviver com obrigações do CDC/Decreto 7.962/2013 quando houver relação de consumo on-line. Recomenda-se revisão por assessoria jurídica para adequação final.",
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
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className="max-h-[90dvh]">
        <ModalHeader>
          <ModalTitle>Política de Privacidade</ModalTitle>
          <ModalDescription className="text-sm text-muted-foreground">
            Vigência: 23/09/2025 · Última atualização: 23/09/2025
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 overflow-y-auto pr-2 text-sm leading-relaxed text-muted-foreground">
          <div className="space-y-2">
            <p>
              Controladora/Operadora: ADVANCE+ CURSOS E TREINAMENTOS LTDA, CNPJ
              25.089.257/0001-92 (base pública), com sede em Av. Juca Sampaio,
              2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP
              57.042-530, Maceió/AL.
            </p>
            <p>
              Canais oficiais: (82) 3234-1397 | (82) 98882-5559 | Atendimento
              seg–sex 08h–20h, sáb 09h–13h.
            </p>
            <p>E-mail do Encarregado (DPO): contato@advancemais.com</p>
            <p>
              Esta Política explica como tratamos dados pessoais de Empresas,
              Candidatos, Alunos, Professores, Profissionais de
              Psicologia/Pedagógico e demais Usuários, conforme a LGPD. Ao usar
              a Plataforma, você concorda com esta Política.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="font-semibold text-base text-foreground">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.content.map((paragraph, index) => (
                    <p key={`${section.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ModalBody>

        <ModalFooter className="justify-end">
          <ButtonCustom
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="min-w-[120px]"
          >
            Fechar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};

export default PrivacyPolicyModal;
