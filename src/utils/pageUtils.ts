
export function getPageTitle(pathname: string, staticPageTitle?: string): string {
  // Default titles for known routes
  const titles: { [key: string]: string } = {
    '/': 'Aktualności',
    '/struktury': 'Struktury',
    '/downloads': 'Pliki do pobrania',
    '/ebooks': 'Publikacje',
    '/auth': 'Logowanie',
    '/o-nas': 'O nas',
  };

  // If we have a static page title from the database, use that
  if (staticPageTitle) {
    return staticPageTitle;
  }

  return titles[pathname] || 'Aktualności';
}
