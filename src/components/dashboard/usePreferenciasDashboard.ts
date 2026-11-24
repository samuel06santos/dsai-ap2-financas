import { useCallback, useState } from 'react';
import {
  cartaoPorId,
  gravarPreferenciasDashboard,
  lerPreferenciasDashboard,
  moverCartao,
  moverCartaoPara,
  preferenciasDashboardPadrao,
  type CartaoDashboardId,
  type PreferenciasDashboard,
} from '../../lib/dashboard';

function posicaoVisivel(ordem: CartaoDashboardId[], ocultos: CartaoDashboardId[], id: CartaoDashboardId): number {
  return ordem.filter((item) => !ocultos.includes(item)).indexOf(id) + 1;
}

/** Ordem e visibilidade dos cartões do Dashboard, lembradas em `localStorage`. */
export function usePreferenciasDashboard() {
  const [prefs, setPrefs] = useState<PreferenciasDashboard>(() => lerPreferenciasDashboard(window.localStorage));
  const [anuncio, setAnuncio] = useState('');

  const gravar = useCallback((nova: PreferenciasDashboard) => {
    setPrefs(nova);
    gravarPreferenciasDashboard(nova, window.localStorage);
    return nova;
  }, []);

  const alternar = useCallback(
    (id: CartaoDashboardId) => {
      const oculto = prefs.ocultos.includes(id);
      gravar({
        ...prefs,
        ocultos: oculto ? prefs.ocultos.filter((item) => item !== id) : [...prefs.ocultos, id],
      });
      setAnuncio(`Cartão ${cartaoPorId(id).titulo} ${oculto ? 'visível' : 'oculto'}.`);
    },
    [prefs, gravar],
  );

  const mover = useCallback(
    (id: CartaoDashboardId, direcao: -1 | 1) => {
      const ordem = moverCartao(prefs.ordem, id, direcao);
      if (ordem === prefs.ordem) return;
      gravar({ ...prefs, ordem });
      setAnuncio(`Cartão ${cartaoPorId(id).titulo} movido para a posição ${posicaoVisivel(ordem, prefs.ocultos, id)}.`);
    },
    [prefs, gravar],
  );

  const moverPara = useCallback(
    (id: CartaoDashboardId, destino: CartaoDashboardId) => {
      const ordem = moverCartaoPara(prefs.ordem, id, destino);
      if (ordem === prefs.ordem) return;
      gravar({ ...prefs, ordem });
      setAnuncio(`Cartão ${cartaoPorId(id).titulo} movido para a posição ${posicaoVisivel(ordem, prefs.ocultos, id)}.`);
    },
    [prefs, gravar],
  );

  const restaurar = useCallback(() => {
    gravar(preferenciasDashboardPadrao());
    setAnuncio('Preferências do dashboard restauradas.');
  }, [gravar]);

  return { ...prefs, anuncio, alternar, mover, moverPara, restaurar };
}
