// This app does not use Supabase Realtime — no channels, no postgres_changes.
//
// createClient() still builds a RealtimeClient in its constructor, and that
// resolves a WebSocket transport up front. On Node < 22 there is no global
// WebSocket, so resolution throws:
//
//   Node.js 20 detected without native WebSocket support.
//
// The throw happens while the Supabase client is being created, so it takes
// down any server function that touches Supabase before a single query runs.
//
// Handing createClient() a transport of our own stops it reaching for one.
// Nothing ever opens a socket; the stub only exists to be passed over. If
// Realtime is ever adopted here, replace it with a real implementation
// (native WebSocket on Node 22+, or the "ws" package on older Node).
class UnsupportedWebSocket {
  constructor() {
    throw new Error(
      "Supabase Realtime is not configured in this app. " +
        "Supply a WebSocket transport in realtime-transport.ts before using channels.",
    );
  }
}

// Browsers and Node 22+ have a native WebSocket; older Node gets the stub.
export const realtimeTransport = (globalThis.WebSocket ??
  UnsupportedWebSocket) as unknown as typeof WebSocket;
