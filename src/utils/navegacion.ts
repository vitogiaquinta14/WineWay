import { router, type Href } from 'expo-router';

/** Vuelve a la pantalla anterior; si se entró directo (link o recarga en web), va a `alternativa`. */
export function volver(alternativa: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(alternativa);
}
