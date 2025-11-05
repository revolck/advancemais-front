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

type TermsOfUseModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const sections: Array<{
  title: string;
  content: string[];
}> = [
  {
    title: "Público e Definições",
    content: [
      "Empresa: pessoa jurídica que divulga vagas, contrata planos/assinaturas e usa serviços B2B.",
      "Candidato(a): pessoa física que cadastra currículo e aplica a vagas.",
      "Aluno(a): pessoa física inscrita em cursos/treinamentos.",
      "Instrutor(a): responsável por conteúdo/avaliações e ministrar cursos.",
      "Profissional de Psicologia/Pedagógico: presta serviços de avaliação/orientação educacional/psicológica na Plataforma.",
      "Usuário(a): qualquer pessoa que acesse ou use a Plataforma.",
    ],
  },
  {
    title: "Elegibilidade e Cadastro",
    content: [
      "2.1. Idade mínima: recomendado para maiores de 18 anos; menores só com consentimento do responsável e observância ao ECA quando aplicável.",
      "2.2. Dados verídicos: você declara fornecer informações verdadeiras, completas e atualizadas.",
      "2.3. Credenciais: mantenha login/senha sob sigilo; atividades feitas na sua conta são de sua responsabilidade.",
      "2.4. Perfis e permissões: funcionalidades variam conforme o papel (Empresa, Candidato, Aluno, Instrutor, Psicologia/Pedagógico).",
    ],
  },
  {
    title: "Planos, Assinaturas e Pagamentos",
    content: [
      "3.1. Planos/benefícios: algumas funções exigem contratação paga; valores e condições são informados antes da compra.",
      "3.2. Cobrança/tributos: podem incidir taxas do meio de pagamento e tributos aplicáveis; comprovantes ficam disponíveis ao contratante.",
      "3.3. Renovação/Cancelamento: renovação pode ser automática (quando indicado). Cancelamentos seguem a política comercial e o CDC quando aplicável ao consumidor.",
      "3.4. Arrependimento (E-commerce): contratações à distância podem ter direito de arrependimento conforme o CDC/Decreto do E-commerce (quando aplicável).",
    ],
  },
  {
    title: "Cursos, Certificados e Comunidade",
    content: [
      "4.1. Conteúdo educacional: pode incluir aulas gravadas/ao vivo, materiais, avaliações e fóruns; disponibilidade varia por curso/turma.",
      "4.2. Certificados: condicionados a requisitos (carga horária, nota, presença, etc.) divulgados na página do curso.",
      "4.3. Propriedade intelectual: materiais são protegidos; é vedada reprodução/distribuição não autorizada.",
      "4.4. Conduta: proibidos plágio, vazamento de avaliações, assédio, burla de acessos ou qualquer ato ilícito.",
    ],
  },
  {
    title: "Vagas e Recrutamento (Empresas x Candidatos)",
    content: [
      "5.1. Publicação: Empresas devem ofertar vagas verdadeiras, lícitas e não discriminatórias.",
      "5.2. Seleção: a Plataforma não garante contratações, idoneidade ou veracidade de dados de terceiros; decisões são da Empresa.",
      "5.3. Currículos: o Candidato autoriza o compartilhamento de seus dados com as Empresas às quais se candidatar.",
      "5.4. Comunicação: pode ocorrer pela Plataforma ou meios informados pela Empresa; use com respeito e proteja dados pessoais.",
    ],
  },
  {
    title: "Serviços de Psicologia/Pedagógicos",
    content: [
      "6.1. Âmbito: serviços de avaliação/orientação prestados por profissionais cadastrados; a relação é diretamente entre profissional e Usuário.",
      "6.2. Limites: não substituem diagnósticos/terapias exigidos por lei; em urgência, procure serviços de saúde.",
    ],
  },
  {
    title: "Privacidade, LGPD e Cookies",
    content: [
      "7.1. Conformidade: tratamos dados pessoais conforme LGPD, Marco Civil da Internet e normas de consumo. Detalhes na Política de Privacidade.",
      "7.2. Bases legais: execução de contrato (inscrição), obrigação legal (fiscal/contábil), legítimo interesse (segurança/antifraude), consentimento quando exigido.",
      "7.3. Direitos do titular: confirmação de tratamento, acesso, correção, portabilidade, anonimização, revogação de consentimento e eliminação (nos termos legais).",
      "7.4. Registros de acesso: guardados pelo prazo legal mínimo (Marco Civil).",
      "7.5. Cookies: usamos cookies para funcionalidade, analytics e personalização; preferências podem ser geridas no banner ou navegador.",
      "7.6. Encarregado/DPO: [inserir nome do DPO] — [inserir e-mail LGPD]. Enquanto não divulgado, use Ouvidoria/FAQ e telefones oficiais.",
      "Advance+",
      "+1",
    ],
  },
  {
    title: "Conteúdos de Usuários e Moderação",
    content: [
      "8.1. Responsabilidade pelo que você publica (textos, imagens, vídeos, avaliações, mensagens).",
      "8.2. Licença de uso (conteúdos públicos): licença não exclusiva e gratuita para hospedagem/exibição na Plataforma.",
      "8.3. Remoção/Suspensão: conteúdos/contas podem ser removidos/suspensos em caso de violação destes Termos, leis ou direitos de terceiros.",
    ],
  },
  {
    title: "Propriedade Intelectual",
    content: [
      "9.1. Plataforma: marcas, logotipos, layouts, software e bases de dados são da Controladora ou licenciados.",
      "9.2. Proibições: copiar, adaptar, decompilar, fazer engenharia reversa, explorar economicamente ou remover avisos de direitos é vedado.",
      "9.3. Denúncias: reporte supostas violações para [inserir e-mail jurídico/suporte].",
    ],
  },
  {
    title: "Disponibilidade, Suporte e Atualizações",
    content: [
      "10.1. Disponibilidade: empregamos esforços razoáveis para manter a operação, sem garantia de ininterruptividade.",
      "10.2. Suporte: via Ouvidoria/FAQ e telefones oficiais nos horários informados.",
      "Advance+",
      "10.3. Alterações: funcionalidades/planos/políticas podem mudar; quando exigido, comunicaremos.",
    ],
  },
  {
    title: "Uso Aceitável",
    content: [
      "É proibido: (a) violar leis; (b) acessar áreas/dados de terceiros; (c) interferir no funcionamento (injeção de código, scraping abusivo, DDoS); (d) usos comerciais não autorizados; (e) contas falsas; (f) compartilhar credenciais; (g) robôs/bots não autorizados; (h) burlar paywalls/assinaturas.",
    ],
  },
  {
    title: "Isenções e Limitações",
    content: [
      "12.1. Conteúdos de terceiros (vagas/currículos/avaliações) são de responsabilidade de quem os publicou.",
      "12.2. Contratação e aprendizagem: não participamos de decisões de contratação, nem garantimos resultados acadêmicos/profissionais.",
      "12.3. Riscos de internet: reconheça riscos (interrupções/ataques) e adote medidas razoáveis (senhas fortes, antivírus).",
      "12.4. Limite de responsabilidade: até o valor pago à Plataforma nos 12 meses anteriores ao evento, na extensão permitida em lei (sem prejuízo de direitos do consumidor).",
    ],
  },
  {
    title: "Links Externos",
    content: [
      "Não nos responsabilizamos por conteúdos/políticas de sites de terceiros; leia os respectivos termos/políticas.",
    ],
  },
  {
    title: "Comunicações",
    content: [
      "Você autoriza comunicações operacionais, transacionais e de marketing (opt-out disponível) por e-mail, push, telefone, WhatsApp/SMS ou dentro da conta.",
    ],
  },
  {
    title: "Encerramento de Conta e Retenção",
    content: [
      "Você pode solicitar encerramento da conta; reteremos registros mínimos exigidos por lei (ex.: logs, fiscais), conforme LGPD/Marco Civil.",
    ],
  },
  {
    title: "E-commerce (quando houver venda à distância)",
    content: [
      "Exibiremos informações essenciais (identificação do fornecedor, características, preço total, despesas, condições de pagamento/prazo, atendimento) conforme CDC e Decreto 7.962/2013.",
    ],
  },
  {
    title: "Alterações destes Termos",
    content: [
      "Podemos alterar a qualquer momento; mudanças relevantes serão comunicadas na Plataforma. O uso após a vigência indica concordância.",
    ],
  },
  {
    title: "Lei e Foro",
    content: [
      "Regidos pelas leis da República Federativa do Brasil (incluindo LGPD, Marco Civil e CDC, quando aplicáveis). Foro eleito: Comarca de Maceió/AL, salvo disposição legal específica.",
    ],
  },
  {
    title: "Contato",
    content: [
      "Ouvidoria/FAQ e suporte: via páginas da Plataforma. Telefones: (82) 3234-1397 | (82) 98882-5559.",
      "Endereço físico: Av. Juca Sampaio, 2247 – sala 30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530, Maceió/AL.",
      "E-mail: [inserir e-mail oficial].",
      "Advance+",
    ],
  },
];

const TermsOfUseModal = ({ isOpen, onOpenChange }: TermsOfUseModalProps) => {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className="max-h-[90dvh]">
        <ModalHeader>
          <ModalTitle>Termos de Uso</ModalTitle>
          <ModalDescription className="text-sm text-muted-foreground">
            Vigência: 23/09/2025 · Última atualização: 23/09/2025
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 overflow-y-auto pr-2 text-sm leading-relaxed text-muted-foreground">
          <div className="space-y-2">
            <p>
              Controladora/Operadora: ADVANCE+ CURSOS E TREINAMENTOS LTDA – ME,
              CNPJ 25.089.257/0001-92, com sede em Av. Juca Sampaio, 2247 – sala
              30, Condomínio Shopping Miramar, Feitosa, CEP 57.042-530,
              Maceió/AL.
            </p>
            <p>
              Canais de atendimento: (82) 3234-1397 | (82) 98882-5559 | Horário
              comercial: seg–sex 08h–20h, sáb 09h–13h.
            </p>
            <p>E-mail de suporte: contato@advancemais.com</p>
            <p>
              Canal de Ouvidoria/FAQ: via páginas “Ouvidoria” e “FAQ” na
              Plataforma. Veja em{" "}
              <a
                href="https://advancemais.com/ouvidoria"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                advancemais.com/ouvidoria
              </a>{" "}
              e{" "}
              <a
                href="https://advancemais.com/faq"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                advancemais.com/faq
              </a>
              .
            </p>
            <p>
              Ao acessar ou usar a Plataforma, você concorda com estes Termos e
              com a nossa Política de Privacidade (LGPD). Se não concordar, não
              utilize a Plataforma. Poderemos atualizar este documento; a versão
              vigente estará sempre nesta página.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">
                  {index + 1}) {section.title}
                </h3>
                <div className="space-y-2">
                  {section.content.map((paragraph, contentIndex) => (
                    <p key={`${section.title}-${contentIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">Aviso</h3>
            <p>
              Este documento reflete legislação brasileira vigente e boas
              práticas, mas não substitui assessoria jurídica. Recomenda-se
              revisão por advogado(a) para adequação às particularidades do seu
              negócio.
            </p>
          </section>
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

export default TermsOfUseModal;
