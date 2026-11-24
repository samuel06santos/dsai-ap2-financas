import { useId } from 'react';
import { Button, IconButton } from '../../ds';
import { cartaoPorId, type CartaoDashboardId } from '../../lib/dashboard';
import './EdicaoDashboard.css';

interface BarraProps {
  onRestaurar: () => void;
  onConcluir: () => void;
}

/** Barra do modo de personalização, exibida acima da grade do Dashboard. */
export function BarraEdicao({ onRestaurar, onConcluir }: BarraProps) {
  return (
    <div className="edicao-dashboard__barra" role="region" aria-label="Modo de personalização">
      <p className="edicao-dashboard__dica">
        Arraste os cartões para reordenar. Use as setas para mover sem mouse e o ✕ para ocultar.
      </p>
      <div className="edicao-dashboard__acoes">
        <Button variante="secundario" tamanho="pequeno" onClick={onRestaurar}>
          Restaurar padrão
        </Button>
        <Button tamanho="pequeno" onClick={onConcluir}>
          Concluir
        </Button>
      </div>
    </div>
  );
}

interface ControlesProps {
  id: CartaoDashboardId;
  primeiro: boolean;
  ultimo: boolean;
  onMover: (id: CartaoDashboardId, direcao: -1 | 1) => void;
  onOcultar: (id: CartaoDashboardId) => void;
}

/** Controles de um cartão no modo de edição: arrastar, mover e ocultar. */
export function ControlesCartao({ id, primeiro, ultimo, onMover, onOcultar }: ControlesProps) {
  const titulo = cartaoPorId(id).titulo;
  return (
    <div className="edicao-dashboard__controles">
      <span className="edicao-dashboard__arrastar" title="Arraste para reordenar" aria-hidden="true">
        ⠿
      </span>
      <span className="edicao-dashboard__nome">{titulo}</span>
      <div className="edicao-dashboard__acoes">
        <IconButton aria-label={`Mover ${titulo} para cima`} icone="↑" tamanho="pequeno" disabled={primeiro} onClick={() => onMover(id, -1)} />
        <IconButton aria-label={`Mover ${titulo} para baixo`} icone="↓" tamanho="pequeno" disabled={ultimo} onClick={() => onMover(id, 1)} />
        <IconButton aria-label={`Ocultar ${titulo}`} icone="✕" tamanho="pequeno" onClick={() => onOcultar(id)} />
      </div>
    </div>
  );
}

interface OcultosProps {
  ids: CartaoDashboardId[];
  onMostrar: (id: CartaoDashboardId) => void;
}

/** Cartões ocultos no modo de edição, com a ação de mostrá-los de novo. */
export function CartoesOcultos({ ids, onMostrar }: OcultosProps) {
  const idTitulo = useId();
  return (
    <section className="edicao-dashboard__ocultos" aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className="edicao-dashboard__ocultos-titulo">
        Cartões ocultos
      </h2>
      <ul className="edicao-dashboard__ocultos-lista">
        {ids.map((id) => {
          const titulo = cartaoPorId(id).titulo;
          return (
            <li key={id} className="edicao-dashboard__ocultos-item">
              <span>{titulo}</span>
              <Button variante="secundario" tamanho="pequeno" aria-label={`Mostrar ${titulo}`} onClick={() => onMostrar(id)}>
                Mostrar
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
