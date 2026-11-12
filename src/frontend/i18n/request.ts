import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [common, booking, account, auth, ui] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/booking/${locale}.json`),
    import(`../messages/account/${locale}.json`),
    import(`../messages/auth/${locale}.json`),
    import(`../messages/ui/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...common.default, ...booking.default, ...account.default, ...auth.default, ...ui.default },
  };
});