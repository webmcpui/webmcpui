import { installFakeAgent } from '@webmcpui/core/testing';

// Install the fake WebMCP host at module load — before any component mounts —
// so the exposed <Button> registers its tool with us on connect.
export const agent = installFakeAgent();
