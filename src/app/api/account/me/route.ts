import { NextResponse } from 'next/server';
import { getCustomer } from '@/server/auth/customerSession';
import { initialsOf } from '@/shared/utils/initials';

export const dynamic = 'force-dynamic';

/** Who is signed in, for the profile icon in the header. Never cached. */
export async function GET() {
  const customer = await getCustomer();
  const body = customer
    ? { signedIn: true, name: customer.fullName, initials: initialsOf(customer.fullName) }
    : { signedIn: false };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}