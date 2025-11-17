import { onRequest as __sitemap_xml_js_onRequest } from "/Users/piotrparulski/kola-mlodych-1/functions/sitemap.xml.js"
import { onRequest as ___middleware_js_onRequest } from "/Users/piotrparulski/kola-mlodych-1/functions/_middleware.js"

export const routes = [
    {
      routePath: "/sitemap.xml",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__sitemap_xml_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]