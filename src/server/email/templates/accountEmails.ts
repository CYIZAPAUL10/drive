import 'server-only';
import { toLang, type Lang } from '@/server/email/labels';
import { button, esc, shell, type Rendered } from './shared';

type Copy = {
  verify: { subject: string; title: string; hello: (name: string) => string; body: string; button: string; expiry: string; footer: string };
  reset: { subject: string; title: string; body: string; button: string; expiry: string; footer: string };
  exists: { subject: string; title: string; body: string; signIn: string; forgot: string; footer: string };
};

// Kinyarwanda is a DRAFT and needs a native-speaker review before launch.
const COPY: Record<Lang, Copy> = {
  en: {
    verify: {
      subject: 'ERVAIS: confirm your email address',
      title: 'Confirm your email address',
      hello: (name) => `Hello ${name},`,
      body: 'Thank you for creating an ERVAIS account. Please confirm your email address to finish.',
      button: 'Confirm my email',
      expiry: 'This link works for 24 hours.',
      footer: 'If you did not create an account, you can ignore this email.',
    },
    reset: {
      subject: 'ERVAIS: reset your password',
      title: 'Reset your password',
      body: 'We received a request to reset the password of your ERVAIS account. Choose a new one with the button below.',
      button: 'Choose a new password',
      expiry: 'This link works for 1 hour and can be used once.',
      footer: 'If you did not ask for this, ignore this email. Your password stays the same.',
    },
    exists: {
      subject: 'ERVAIS: you already have an account',
      title: 'You already have an account',
      body: 'Someone, hopefully you, tried to create an ERVAIS account with this email address, but one already exists. You can sign in, or choose a new password if you have forgotten it.',
      signIn: 'Sign in',
      forgot: 'Forgot password',
      footer: 'If this was not you, you can ignore this email.',
    },
  },
  fr: {
    verify: {
      subject: 'ERVAIS : confirmez votre adresse e-mail',
      title: 'Confirmez votre adresse e-mail',
      hello: (name) => `Bonjour ${name},`,
      body: "Merci d'avoir créé un compte ERVAIS. Confirmez votre adresse e-mail pour terminer.",
      button: 'Confirmer mon e-mail',
      expiry: 'Ce lien est valable 24 heures.',
      footer: "Si vous n'avez pas créé de compte, vous pouvez ignorer ce message.",
    },
    reset: {
      subject: 'ERVAIS : réinitialisez votre mot de passe',
      title: 'Réinitialisez votre mot de passe',
      body: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte ERVAIS. Choisissez-en un nouveau avec le bouton ci-dessous.",
      button: 'Choisir un nouveau mot de passe',
      expiry: "Ce lien est valable 1 heure et ne peut être utilisé qu'une fois.",
      footer: "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message. Votre mot de passe ne change pas.",
    },
    exists: {
      subject: 'ERVAIS : vous avez déjà un compte',
      title: 'Vous avez déjà un compte',
      body: "Quelqu'un, peut-être vous, a essayé de créer un compte ERVAIS avec cette adresse e-mail, mais un compte existe déjà. Vous pouvez vous connecter, ou choisir un nouveau mot de passe si vous l'avez oublié.",
      signIn: 'Se connecter',
      forgot: 'Mot de passe oublié',
      footer: "Si ce n'était pas vous, vous pouvez ignorer ce message.",
    },
  },
  rw: {
    verify: {
      subject: 'ERVAIS: emeza imeri yawe',
      title: 'Emeza imeri yawe',
      hello: (name) => `Muraho ${name},`,
      body: 'Murakoze gufungura konti ya ERVAIS. Emeza imeri yawe kugira ngo urangize.',
      button: 'Emeza imeri yanjye',
      expiry: 'Iri huza rimara amasaha 24.',
      footer: 'Niba utafunguye konti, ushobora kutita kuri iyi imeri.',
    },
    reset: {
      subject: 'ERVAIS: ongera ushyireho ijambobanga',
      title: 'Ongera ushyireho ijambobanga',
      body: 'Twakiriye ubusabe bwo guhindura ijambobanga rya konti yawe ya ERVAIS. Hitamo irishya ukoresheje buto iri hasi.',
      button: 'Hitamo ijambobanga rishya',
      expiry: 'Iri huza rimara isaha 1 kandi rikoreshwa rimwe gusa.',
      footer: 'Niba utari wowe wabisabye, ntiwite kuri iyi imeri. Ijambobanga ryawe ntirihinduka.',
    },
    exists: {
      subject: 'ERVAIS: usanzwe ufite konti',
      title: 'Usanzwe ufite konti',
      body: 'Hari umuntu, wenda ari wowe, washatse gufungura konti ya ERVAIS akoresheje iyi imeri, ariko isanzwe ibaho. Ushobora kwinjira, cyangwa guhitamo ijambobanga rishya niba waryibagiwe.',
      signIn: 'Injira',
      forgot: 'Naribagiwe ijambobanga',
      footer: 'Niba atari wowe, ushobora kutita kuri iyi imeri.',
    },
  },
};

/** Subjects hold only our own fixed text. User text (the name) appears only in the escaped body. */
export function renderVerifyEmail(input: { language: string; name: string; url: string }): Rendered {
  const lang = toLang(input.language);
  const c = COPY[lang].verify;
  const body =
    `<h1 style="margin:0 0 12px;font-size:22px;">${esc(c.title)}</h1>` +
    `<p style="margin:0 0 12px;">${esc(c.hello(input.name))}</p>` +
    `<p style="margin:0 0 16px;">${esc(c.body)}</p>` +
    `<p style="margin:0 0 16px;">${button(input.url, c.button)}</p>` +
    `<p style="margin:0;color:#4b5563;">${esc(c.expiry)}</p>`;
  const html = shell({ lang, title: c.subject, preheader: c.title, body, footer: esc(c.footer) });
  const text = [c.title, '', c.hello(input.name), '', c.body, '', input.url, '', c.expiry, '', c.footer].join('\n');
  return { subject: c.subject, html, text };
}

export function renderResetEmail(input: { language: string; url: string }): Rendered {
  const lang = toLang(input.language);
  const c = COPY[lang].reset;
  const body =
    `<h1 style="margin:0 0 12px;font-size:22px;">${esc(c.title)}</h1>` +
    `<p style="margin:0 0 16px;">${esc(c.body)}</p>` +
    `<p style="margin:0 0 16px;">${button(input.url, c.button)}</p>` +
    `<p style="margin:0;color:#4b5563;">${esc(c.expiry)}</p>`;
  const html = shell({ lang, title: c.subject, preheader: c.title, body, footer: esc(c.footer) });
  const text = [c.title, '', c.body, '', input.url, '', c.expiry, '', c.footer].join('\n');
  return { subject: c.subject, html, text };
}

export function renderAccountExistsEmail(input: { language: string; loginUrl: string; forgotUrl: string }): Rendered {
  const lang = toLang(input.language);
  const c = COPY[lang].exists;
  const body =
    `<h1 style="margin:0 0 12px;font-size:22px;">${esc(c.title)}</h1>` +
    `<p style="margin:0 0 16px;">${esc(c.body)}</p>` +
    `<p style="margin:0;">${button(input.loginUrl, c.signIn)}${button(input.forgotUrl, c.forgot, 'secondary')}</p>`;
  const html = shell({ lang, title: c.subject, preheader: c.title, body, footer: esc(c.footer) });
  const text = [c.title, '', c.body, '', `${c.signIn}: ${input.loginUrl}`, `${c.forgot}: ${input.forgotUrl}`, '', c.footer].join('\n');
  return { subject: c.subject, html, text };
}