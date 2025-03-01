
export function getPageTitle(pathname: string, staticPageTitle?: string): string {
  // Default titles for known routes
  const titles: { [key: string]: string } = {
    '/': 'Aktualności',
    '/kola-mlodych': 'Lista Kół Młodych',
    '/downloads': 'Pliki do pobrania',
    '/ebooks': 'Publikacje',
    '/auth': 'Logowanie',
  };

  // If we have a static page title from the database, use that
  if (staticPageTitle) {
    return staticPageTitle;
  }

  return titles[pathname] || 'Aktualności';
}
