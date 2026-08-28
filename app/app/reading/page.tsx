import { redirect } from 'next/navigation';

/**
 * /reading is the reading room, and the reading room IS the home page now
 * (Peter, 2026-08-27: land on the chat). Any old link to /reading lands here
 * and forwards — the route survives, the page does not need to.
 */
export default function ReadingRedirect() {
  redirect('/');
}
