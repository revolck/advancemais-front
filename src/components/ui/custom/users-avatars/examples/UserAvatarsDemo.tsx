"use client";

import { UserAvatars } from "../UserAvatars";

export default function UserAvatarsDemo() {
  const users = [
    { id: 1, name: "Alice", image: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Bob", image: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Charlie", image: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Diana", image: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Eve", image: "https://i.pravatar.cc/150?img=5" },
    { id: 6, name: "Frank", image: "https://i.pravatar.cc/150?img=6" },
    { id: 7, name: "Grace", image: "https://i.pravatar.cc/150?img=7" },
    { id: 8, name: "Hank", image: "https://i.pravatar.cc/150?img=8" },
  ];

  return (
    <div className="space-y-8 p-10">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">UserAvatars Component Demo</h2>

        {/* Exemplo básico */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Exemplo Básico</h3>
          <UserAvatars users={users} maxVisible={5} />
        </div>

        {/* Diferentes tamanhos */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Diferentes Tamanhos</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Pequeno (32px)</p>
              <UserAvatars users={users.slice(0, 4)} size={32} maxVisible={3} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Médio (48px)</p>
              <UserAvatars users={users.slice(0, 4)} size={48} maxVisible={3} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Grande (80px)</p>
              <UserAvatars users={users.slice(0, 4)} size={80} maxVisible={3} />
            </div>
          </div>
        </div>

        {/* Diferentes sobreposições */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Diferentes Sobreposições</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Sobreposição Apertada (80%)
              </p>
              <UserAvatars
                users={users.slice(0, 5)}
                overlap={80}
                maxVisible={4}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Sobreposição Normal (60%)
              </p>
              <UserAvatars
                users={users.slice(0, 5)}
                overlap={60}
                maxVisible={4}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Sobreposição Solta (40%)
              </p>
              <UserAvatars
                users={users.slice(0, 5)}
                overlap={40}
                maxVisible={4}
              />
            </div>
          </div>
        </div>

        {/* Direção da direita para esquerda */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Direita para Esquerda</h3>
          <UserAvatars
            users={users.slice(0, 6)}
            isRightToLeft={true}
            maxVisible={4}
          />
        </div>

        {/* Apenas sobreposição (sem deslocamento) */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Apenas Sobreposição</h3>
          <UserAvatars
            users={users.slice(0, 6)}
            isOverlapOnly={true}
            maxVisible={4}
          />
        </div>

        {/* Tooltip no topo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Tooltip no Topo</h3>
          <UserAvatars
            users={users.slice(0, 5)}
            tooltipPlacement="top"
            maxVisible={4}
          />
        </div>

        {/* Com callbacks */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Com Callbacks</h3>
          <UserAvatars
            users={users.slice(0, 5)}
            maxVisible={4}
            onAvatarClick={(user, index) => {
              console.log(`Clicou no usuário: ${user.name} (índice: ${index})`);
            }}
            onHover={(user, index) => {
              console.log(`Hover no usuário: ${user.name} (índice: ${index})`);
            }}
            onHoverEnd={() => {
              console.log("Hover terminou");
            }}
          />
        </div>

        {/* Com usuários sem nome */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Usuários Sem Nome</h3>
          <UserAvatars
            users={[
              {
                id: 1,
                name: "Alice",
                image: "https://i.pravatar.cc/150?img=1",
              },
              { id: 2, image: "https://i.pravatar.cc/150?img=2" },
              {
                id: 3,
                name: "Charlie",
                image: "https://i.pravatar.cc/150?img=3",
              },
              { id: 4, image: "https://i.pravatar.cc/150?img=4" },
            ]}
            maxVisible={3}
          />
        </div>
      </div>
    </div>
  );
}
